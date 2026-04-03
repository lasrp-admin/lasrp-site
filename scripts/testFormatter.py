import json
import csv
import sys

def convert_csv_to_mock_json(csv_file, json_file):
    with open(csv_file, newline='') as f:
        reader = csv.reader(f)
        # Skip header if necessary, but the formatter expects all rows to be checked for status
        data = list(reader)
    
    mock_json = {
        "results": [
            {
                "result": {
                    "rawData": data
                }
            }
        ]
    }
    
    with open(json_file, 'w') as f:
        json.dump(mock_json, f)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python scripts/test_formatter.py input.csv output.json")
    else:
        convert_csv_to_mock_json(sys.argv[1], sys.argv[2])
