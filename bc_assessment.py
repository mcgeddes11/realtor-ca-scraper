# Script to find the ID for the address and get the latest assessment
import requests, json
from urllib import parse
from bs4 import BeautifulSoup


def get_property_id(property_address):
    # base bc assessment url
    base_url = "https://www.bcassessment.ca"
    # property search by address url
    url = "/Property/Search/GetByAddress?addr="
    # url encode address string
    address_url = parse.quote(property_address)
    # call endpoint
    response = requests.get(base_url + url + address_url)
    if response.status_code != 200:
        response.raise_for_status()
    json_data = response.json()
    if len(json_data) > 1:
        print("Multiple results returned: {}".format(json.dumps(json_data)))
        return None
    elif len(json_data) == 1 and json_data[0]["label"] == "No results":
        print("No results found")
        return None
    else:
        print("Property id found: {}".format(json_data[0]["value"]))
        return json_data[0]["value"]

def get_property_value(property_id):
    # Define url and divs for extraction
    url = "https://www.bcassessment.ca//Property/Info/" + property_id
    assessed_value_div_id = "lblTotalAssessedValue"
    assessed_date_div_id = "lblLastAssessmentDate"
    # Do GET request
    response = requests.get(url)
    if response.status_code != 200:
        response.raise_for_status()

    # Use BS to get the two elements we care about
    html_data = response.text
    soup = BeautifulSoup(html_data, features="lxml")
    assessed_value = soup.find(id=assessed_value_div_id).text
    assessed_date = soup.find(id=assessed_date_div_id).text

    # Convert to correct datatypes
    assessed_value = int(assessed_value.replace("$","").replace(",",""))
    return {"assessed_value": assessed_value, "assessed_date": assessed_date}



if __name__ == "__main__":
    # beises = "3333 keats st"
    # get_property_id(beises)
    # home = "3972 south valley drive"
    # get_property_id(home)
    inlaws = "2739 whitehead place"
    print("Property address: {}".format(inlaws))
    id = get_property_id(inlaws)
    assessment = get_property_value(id)
    print(assessment)


