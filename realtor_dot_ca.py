import requests, json
from bs4 import BeautifulSoup

# Basics (run each day):
# 1. Read in previous file.  If doesn't exist, create one.
# 2. Pull all listings. Update prices etc. from previous file. Grab details for each new property.
# 3. Get assessed value from BC assessment.
# 4. Compute the stuff I've been doing (rental rates, mortgage amounts, gross and net ROI, etc.)
# 5. Save new dated file

BASE_URL = "https://realtor.ca"


def search_properties_with_options(options_dict):
    url = "https://api37.realtor.ca/Listing.svc/PropertySearch_Post"
    response = requests.post(url=url, data=options_dict)
    if response != 200:
      response.raise_for_status()
    data = response.json()
    return data

def get_property_details_with_options(options):
    url = "https://api37.realtor.ca//Listing.svc/PropertyDetails"
    response = requests.get(url=url, params=options)
    if response.status_code != 200:
        response.raise_for_status()
    data = response.json()
    return data

# def get_property_details_by_url(property_url):
#     response = requests.get(property_url)
#     if response.status_code != 200:
#       response.raise_for_status()
#     soup = BeautifulSoup(response.text, features="lxml")
#     div_id = "listingDetailsBuildingCon"
#     details_tab = soup.find(id=div_id)
#     return details_tab


if __name__ == "__main__":

    # This is a search for :
    # - apartments (OwnershipTypeGroupId = 2)
    # - of type condo/strata (PropertySearchTypeId = 1)
    # - for less than $400,000
    # - within Victoria (lat/long range)
    # - returning 150 records per page (RecordsPerPage = 150)
    # form = {
    # "LongitudeMin": -123.524944,
    # "LongitudeMax": -123.332315,
    # "LatitudeMin": 48.424997,
    # "LatitudeMax": 48.488415,
    # "PriceMin": 0,
    # "PriceMax": 400000,
    # "RecordsPerPage": 150,
    # "CultureId": 1,
    # "ApplicationId": 1,
    # "PropertySearchTypeId": 1,
    # "OwnershipTypeGroupId": 2}
    #
    # data = search_properties_with_options(form)

    options = {"PropertyId" :22355721,
               "ApplicationId": 37,
               "CultureId": 1,
               "HashCode": 0,
               "ReferenceNumber":855511}
#     data = get_property_details_with_options(options)
#     print(data)
#
# with open("test_details.json", "w") as f:
#     json.dump(data,f)



