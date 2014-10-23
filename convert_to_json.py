import json, csv

# see http://www.census.gov/acs/www/Downloads/data_documentation/pums/DataDict/PUMSDataDict12.pdf under "PERSON DATA"

filename = "nyc-sample-100.csv"

def record_to_json(person):
	def field(name, process_func=None, allocation_flag=None, fallback=None):
		f = person[name]
		if f == '': return fallback
		if process_func:
			f = process_func(f)
		return f
	record = {
		"puma": person['PUMA'],
		"weight": field('PWGTP', float),
		"age": field('AGEP', float),
		"citizen": field("CIT", lambda x: ["", "US-born", "US-territory-born", "born abroad to US parents", "naturalized", "non-citizen"][int(x)]), # 1: US-born; 2: US-territory-born; 3: born abroad to American; 4: naturalized; 5: non-citizen
		"transport_to_work": field("JWTR", lambda x: ["", "car/truck/van", "bus", "streetcar", "subway", "railway", "ferry", "taxi", "motorcycle", "bicycle", "walk", "work at home", "other"][int(x)]),
		"lang_other_than_english_at_home": field("LANX", lambda x: ["", "No", "Yes"][int(x)]),
		"married": field("MAR", lambda x: ["", "married", "widowed", "divorced", "separated", "never married"][int(x)]),
		"education": field("SCHL", parse_education),
		"education_group": education_group(person),
		"sex": field("SEX", lambda x: ["", "male", "female"][int(x)]),
		"personal_income": field("PINCP", int, fallback=0),
		"hours_worked_per_week": field("WKHP", int),
		"year_of_entry": field("YOEP", int),
		"first_ancestry": field("ANC1P", ancestry),
		"has_health_insurance": field("HICOV", lambda x: ["", "Insured", "Not insured"][int(x)]),
		"broad_race": broad_race(person),
		"veteran_service": field("VPS", parse_vet),
		"area_of_birth": field("WAOB", lambda x: ["", "US", "US Territory", "Latin America", "Asia", "Europe", "Africa", "North America", "Oceania"][int(x)]),
		"occupation": occupation(person),
		"occupation_group": occupation_group(person)
		}
	return record

def convert():
	people = []
	for person in csv.DictReader(open(filename)):
		people.append(record_to_json(person))

	json.dump(people, open(filename.split('.')[0]+'.json', 'w'))

# other things: degree, duration of commute, duration of workday, home lang, place of birth

def occupation(person):
	occp = raw_occupation(person)
	if occp and '-' in occp:
		return occp.split('-',1)[-1]
	else:
		return occp

def occupation_group(person):
	occp = raw_occupation(person)
	group_names = {
		"MGR": "manager",
		"BUS": "businessperson",
		"FIN": "finance",
		"CMM": "computers/math",
		"ENG": "engineer",
		"SCI": "scientist",
		"CMS": "religious/social worker",
		"LGL": "legal",
		"EDU": "educator",
		"ENT": "entertainment",
		"MED": "medicine",
		"HLS": "healthcare support",
		"PRT": "protective services (police/fire, etc)",
		"EAT": "food worker",
		"CLN": "cleaner",
		"PRS": "personal care and service",
		"SAL": "sales",
		"OFF": "office worker",
		"FFF": "farm worker",
		"CON": "construction-related worker",
		"EXT": "miner",
		"RPR": "installation, maintainance and repair",
		"PRD": "production worker",
		"TRN": "transportation",
		"MIL": "military"
	}
	if occp and '-' in occp:
		return group_names.get(occp.split('-')[0], None)
	else:
		return occp

occupations_by_code = json.load(open("occupations.json"))
def raw_occupation(person):
	occp = person['OCCP']
	if occp == '':
		return None
	return occupations_by_code.get(str(int(occp)), None)

def ancestry(val):
	i = int(val)
	return 

def broad_race(person):
	keys = [("RACAIAN", "American Indian"), ("RACASN", "Asian"), ("RACBLK", "Black"), ("RACNH", "Native Hawaiian"), ("RACPI", "Pacific Islander"), ("RACWHT", "White"), ("RACSOR", "Other")]
	for key, name in keys:
		if person[key] == '1':
			return name
	return None

def parse_vet(val):
	periods = ["", "Iraq/Afghanistan", "Iraq/Afghanistan and Gulf War", "Iraq/Afghanistan, Gulf War and Vietnam", "Gulf War", "Gulf War and Vietnam", "Vietnam", "Vietnam and Korean War", "Vietnam, Korea and WWII", "Korean War", "Korean War and WWII", "Service between Gulf War and Vietnam era", "Service between Vietnam era and Korean war", "Service between WWII and Korean War", "Pre-WWII service"]
	return periods[int(val)]

def parse_education(value):
	i = int(value)
	return ["", "None", "Preschool", "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12 - no diploma", "High school graduate", "GED", "<1 year college", ">1 year college", "associate's", "bachelor's", "master's", "professional degree", "doctorate"][i]

def education_group(person):
	levels = [(15, "No high-school diploma"), (16, "High-school"), (17, "GED"), (19, "Some college"), (20, "associate's"), (21, "bachelor's"), (22, "master's"), (23, "professional degree"), (24, "doctorate")]
	level = person['SCHL']
	if level == "":
		return None
	else:
		l = int(level)
		for (val, name) in reversed(levels):
			if l >= val:
				return name
		return None

if __name__=='__main__':
	convert()

