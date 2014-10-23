import csv
import random

def take(n):
	TAKE = 100

	total_people = -1
	for _ in open('nyc-sample-5000.csv'):
		total_people += 1

	read = 0
	written = 0

	for person in csv.DictReader(open("nyc-sample-5000.csv")):
		left_to_read = (total_people - (read))
		left_to_write = TAKE - written
		prob_write = left_to_write * 1.0 / left_to_read
		if random.random() < prob_write:
			yield person
			written += 1
	read += 1
