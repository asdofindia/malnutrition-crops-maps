import pandas as pd
import numpy as np

current_data = pd.read_excel("data.xlsx")
old_data = pd.read_csv("data-expanded.csv")
old_data['state'] = old_data['state'].str.lower()
old_data['district'] = old_data['district'].str.lower()

full_data = current_data.merge(old_data, left_on=['State', 'District'], right_on=['state', 'district'], how="outer")

# full_data[['Jowar_x', 'Jowar_y']].to_csv("jowar-comparison.csv")
full_data['jowar_bajra_other'] = full_data["per_capita_jowar"] + full_data["per_capita_bajra"] + full_data["per_capita_other_cereal_millet"]

full_data.to_csv('data.csv')