import json


# Open the incorrectly formatted file
with open('transcripts.json', 'r') as infile:
    # Read all lines
    lines = infile.readlines()

# Open a new file to write the corrected format
with open('correct_format.json', 'w') as outfile:
    for line in lines:
        # Replace tuple parentheses with list brackets
        line = line.replace('(', '[').replace(')', ']')
        # Ensure keys and strings are enclosed in double quotes
        line = line.replace("'", '"')
        outfile.write(line)


