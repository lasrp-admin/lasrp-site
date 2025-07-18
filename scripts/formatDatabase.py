import argparse
import re
import csv
import json

STATUS_COL = 0
RESOURCE_TYPE_COL = 1
RESOURCE_NAME_COL = 2
ID_COL = 3
DESCRIPTION_COL = 4
AUDIENCE_COL = 5
LANGUAGES_COL = 6
OTHER_COL = 7
ELIGIBILITY_COL = 8
ELIGIBILITY_EXTRA_COL = 9
EMAIL_COL = 10
PHONE_COL = 11
HOURS_COL = 12
CONTACT_PERSON_COL = 13
CONTACT_LINK_COL = 14
WEBSITE_COL = 15
ADDRESS_COL = 16
NEIGHBORHOOD_COL = 17
MORE_INFO_COL = 18

STABLE_ENTRY = "COMPLETE & VERIFIED"

emoji_pattern = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map symbols
    "\U0001F1E0-\U0001F1FF"  # flags
    "\U00002702-\U000027B0"  # other symbols
    "\U000024C2-\U0001F251"
    "\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
    "\U0001FA70-\U0001FAFF"  # Extended symbols
    "\u200d"                 # zero-width joiner
    "\u2640-\u2642"          # gender symbols
    "\u2600-\u2B55"          # misc symbols
    "\u23cf"                 # eject symbol
    "\u23e9"                 # fast-forward
    "\u231a"                 # watch
    "\ufe0f"                 # variation selector
    "]+",
    flags=re.UNICODE
)

def strip_emojis(text):
	return emoji_pattern.sub(r'', text).strip()

def smart_split(text):
	return re.split(r",\s*", text)

def main():
	# Arg parsing
	parser = argparse.ArgumentParser(description="CSV to JSON converter.")
	parser.add_argument("input_file", type=str, help="Name of input raw JSON file.")
	parser.add_argument("output_file", type=str, help="Name of output formatted JSON file.")
	args = parser.parse_args()

	with open(args.input_file, newline='') as input_data, open(args.output_file, "w") as output_data:
		out = {}
		data = json.load(input_data)['results'][0]['result']["rawData"]

		for row in data:
			if row[STATUS_COL] == STABLE_ENTRY:
				out[row[ID_COL]] = {
					"name": row[RESOURCE_NAME_COL],
					"id": row[ID_COL],
					"type": smart_split(strip_emojis(row[RESOURCE_TYPE_COL])),
					"description": row[DESCRIPTION_COL],
					"audience": smart_split(row[AUDIENCE_COL]),
					"language": smart_split(row[LANGUAGES_COL]),
					"other": smart_split(row[OTHER_COL]),
					"eligibility": smart_split(row[ELIGIBILITY_COL]),
					"eligibilityText": row[ELIGIBILITY_EXTRA_COL],
					"email": row[EMAIL_COL],
					"phone": row[PHONE_COL],
					"hours": row[HOURS_COL],
					"contactPerson": row[CONTACT_PERSON_COL],
					"contactLink": row[CONTACT_LINK_COL],
					"website": row[WEBSITE_COL],
					"address": row[ADDRESS_COL],
					"neighborhood": smart_split(row[NEIGHBORHOOD_COL]),
					"moreInfo": row[MORE_INFO_COL]					
				}

		json.dump(out, output_data, indent=2)

if __name__ == "__main__":
	main()