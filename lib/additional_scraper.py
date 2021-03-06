import json
import sys
import re
import string
from bs4 import BeautifulSoup
import pdb
import urllib.request
from urllib import parse

page_name = "https://en.wikipedia.org/w/index.php?title=Category:Rare_diseases&from="
diseases = set()


################################## MAIN LOOP ##################################

diseases = [
"African_trypanosomiasis",
"Lymphatic_filariasis",
"Japanese_encephalitis",
"Dracunculiasis",
"Filariasis",
"Soil-transmitted_helminthiasis",
"Helminthiasis",
"Schistosomiasis",
"Leishmaniasis",
"Paragonimiasis",
"Opisthorchiasis",
"Echinococcosis",
"Onchocerciasis",
"Schistosoma_bovis",
"Spondweni_fever",
"Lobomycosis",
"Chikungunya",
"Tropical_eosinophilia",
"Cryptococcosis",
"Granulomatous_amoebic_encephalitis",
"Aspergillosis",
"Tularemia",
"Eastern_equine_encephalitis_virus",
"Intestinal_capillariasis",
"Venezuelan_equine_encephalitis_virus",
"Middle_East_respiratory_syndrome"
];

diseases_batch = 0
diseases_dict = {}
for disease in diseases:

  opener = urllib.request.build_opener()
  opener.addheaders = [('User-agent', 'Mozilla/5.0')] #wikipedia needs this

  resource = opener.open("https://en.wikipedia.org/wiki/" + urllib.parse.quote(disease))
  data = resource.read()
  resource.close()

  soup = BeautifulSoup(data, "html.parser")
  disease_content = soup.find(id="mw-content-text").get_text()
  disease_summary = re.sub('\[.{1}\]', '', soup.find('p').get_text())

  regex = r"<a.*?>(.*?)<\/a>"
  symptoms = json.loads(open('../symptoms.js', 'r').read())
  symptoms_regex = ""
  group_count = 0

  symptoms_array = set()
  complete_symptom_list = set()


  for symptom in symptoms['symptoms']:
    group_count += 1
    symptoms_array.add(symptom)

    if group_count == 100:
      # we must batch the regex match since there is a 100 group count limit
      symptoms_array = list(symptoms_array)
      symptoms_regex = "|".join(symptoms_array)
      sd_matches = re.findall(r'%s' % symptoms_regex, disease_content, re.IGNORECASE)

      for sd_match in sd_matches:
        complete_symptom_list.add(sd_match.lower())

      symptoms_array = set()
      symptoms_regex = ""
      group_count = 0

  disease_formatted = re.sub('_', ' ', parse.unquote(disease))

  if not complete_symptom_list:
    print("No symptoms: not adding {} to JSON".format(disease_formatted))
  else:
    print("Adding {} to JSON".format(disease_formatted))
    diseases_dict[disease_formatted] = {
        'symptoms': list(complete_symptom_list),
        'summary': disease_summary,
        'url': "https://en.wikipedia.org/wiki/" + disease
    }

  diseases_batch += 1
  if diseases_batch == 300:
    joined_diseases = ", ".join(diseases_dict.keys())
    print("Writing to diseases.js: {}".format(joined_diseases))
    with open("../additional_diseases.js", "a") as diseases_file:
      json.dump(diseases_dict, diseases_file)
      diseases_file.write("\n")

    diseases_dict = {}
    diseases_batch = 0

joined_diseases = ", ".join(diseases_dict.keys())
print("Final write to diseases.js: {}".format(joined_diseases))
with open("../additional_diseases.js", "a") as diseases_file:
  json.dump(diseases_dict, diseases_file, indent=2)

