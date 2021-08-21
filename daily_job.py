import pandas, numpy
import os
from bc_assessment import get_property_id, get_property_value
from realtor_dot_ca import search_properties_with_options, get_property_details_with_options, BASE_URL

def extract_datapoints(result):
    # Pull out items we need
    d = {"id": result["Id"],
         "mls_number": result["MlsNumber"],
         "num_beds": result["Building"]["Bedrooms"],
         "num_baths": result["Building"]["BathroomTotal"],
         "num_parking": result["Property"]["ParkingSpaceTotal"] if "ParkingSpaceTotal" in result["Property"].keys() else 0,
         "sqft_total": result["Building"]["SizeInterior"] if "SizeInterior" in result["Building"].keys() else None,
         "price": result["Property"]["Price"],
         "address": result["Property"]["Address"]["AddressText"].replace("|", ", "),
         "property_url": BASE_URL + result["RelativeURLEn"],
         "photo_change_date": result["PhotoChangeDateUTC"] if "PhotoChangeDateUTC" in result.keys() else None}
    # Call BC assessment API to get assessed value
    address_split = result["Property"]["Address"]["AddressText"].split("|")[0].lower()
    assessment_id = get_property_id(address_split)
    if assessment_id is not None:
        assessment = get_property_value(assessment_id)
        d["assessed_value"] = assessment["assessed_value"]
        d["assessed_date"] = assessment["assessed_date"]
    else:
        d["assessed_value"] = None
        d["assessed_date"] = None

    # Now we need to call the realtor.ca details API to grab a couple key pieces of data (taxes and fees)
    detail_options = {"PropertyId": result["Id"],
                      "ApplicationId": 37,
                      "CultureId": 1,
                      "HashCode": 0,
                      "ReferenceNumber": result["MlsNumber"]}
    property_details = get_property_details_with_options(detail_options)
    d["maintenance_fee"] = property_details["Property"]["MaintenanceFee"] if "MaintenanceFee" in property_details[
        "Property"].keys() else None
    d["property_tax"] = property_details["Property"]["TaxAmount"] if "TaxAmount" in property_details[
        "Property"].keys() else None
    d["build_date"] = property_details["Building"]["ConstructedDate"] if "ConstructedDate" in property_details[
        "Building"].keys() else None
    return d

def update_csv(df, options):
    # Find properties in our zone
    data = search_properties_with_options(options)
    print("Results to process: {}".format(len(data["Results"])))
    new_output = []

    for result in data["Results"]:
        if int(result["Id"]) not in df["id"].values.tolist():
            d = extract_datapoints(result)
            new_output.append(d)
        else:
            # TODO: update values for this id
            print("Property ID {} already found".format(result["Id"]))
    if len(new_output) > 0:
        df_new = pandas.DataFrame.from_records(new_output)
        df = pandas.concat((df, df_new), axis=0, sort=False)
        df = df.reset_index(drop=True)
    df = correct_datatypes(df)
    df = update_status(df, data)
    return df

def create_csv(options):
    # Find properties in our zone
    data = search_properties_with_options(options)
    # Assign output list
    output = []

    print("Results to process: {}".format(len(data["Results"])))

    for result in data["Results"]:
        d = extract_datapoints(result)
        output.append(d)
    df = pandas.DataFrame.from_records(output)
    df = correct_datatypes(df)
    df = update_status(df, data)
    return df

def correct_datatypes(df):
    df["price"] = [int(x.replace("$", "").replace(",", "")) if type(x) == str else x for x in df["price"]]
    df["property_tax"] = [float(x.replace("$", "").replace(",", "")) if type(x) == str and x is not None else x for x in df["property_tax"]]
    df["maintenance_fee"] = [float(x.replace("$", "").replace(",", "").replace("Monthly","")) if type(x) == str and x is not None else x for x in df["maintenance_fee"]]
    df["build_date"] = [int(x) if type(x) == str and x is not None else x for x in df["build_date"].values]
    df["num_beds"] = [int(x) if type(x) == str and x is not None else x for x in df["num_beds"].values]
    df["num_baths"] = [int(x) if type(x) == str and x is not None else x for x in df["num_baths"].values]
    df["num_parking"] = [int(x) if type(x) == str and x is not None else x for x in df["num_parking"].values]
    return df

def update_status(df, search_results):
    search_ids = [x["Id"] for x in search_results["Results"]]
    # Set everything to sold
    df["sold_status"] = "Sold"
    for ix, row in df.iterrows():
        if str(row["id"]) in search_ids:
            df["sold_status"] = "Available"
            # TODO: update with current pricing

    return df

if __name__ == "__main__":
    # Define my situation
    deposit_amount = 250000
    mortgage_rate = 0.02
    amortization_period = 25

    # TODO: include Local Logic data in spreadsheet

    # Rental rates for Victoria, based on bedrooms
    rental_rates = {0: 1300, 1: 1550, 2: 1950, 3:2600}


    # Define search criteria
    options = {
        "LongitudeMin": -123.524944,
        "LongitudeMax": -123.332315,
        "LatitudeMin": 48.424997,
        "LatitudeMax": 48.488415,
        "PriceMin": 0,
        "PriceMax": 400000,
        "RecordsPerPage": 200,
        "CultureId": 1,
        "ApplicationId": 1,
        "PropertySearchTypeId": 1,
        "OwnershipTypeGroupId": 2}

    excel_path = "/home/joncocks/data/realtor_ca/properties.xlsx"
    if os.path.exists(excel_path):
        df = pandas.read_excel(excel_path)
        df_out = update_csv(df, options)
    else:
        df_out = create_csv(options)

    # Compute mortgage payments
    df_out["monthly_mortgage_payments"] = [numpy.pmt(mortgage_rate / 12, 12*amortization_period, deposit_amount-x) if x > deposit_amount else 0 for x in df_out["price"].values]
    # Do net income
    df_out["monthly_rental_income"] = [rental_rates[int(x)] for x in df_out["num_beds"].values]
    df_out["net_monthly_income"] = df_out["monthly_rental_income"] - df_out["maintenance_fee"] - df_out["monthly_mortgage_payments"] - df_out["property_tax"] / 12
    # Compute price to assessed value
    df_out["price_to_assessment_ratio"] = (df_out["price"] - df_out["assessed_value"]) / df_out["price"]
    # Net ROI
    df_out["net_roi_annual"] = (df_out["net_monthly_income"] * 12) / numpy.array([x if deposit_amount > x else deposit_amount for x in df_out["price"].values])

    # Sort descending by date to put new entries at the top
    df_out = df_out.sort_values(by="photo_change_date", ascending=False)

    df_out.to_excel(excel_path, index=False)

