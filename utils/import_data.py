import pandas as pd
import sys

infile = sys.argv[1]
db_key = sys.argv[2]


df = pd.read_csv(infile, sep=';', decimal=',')

