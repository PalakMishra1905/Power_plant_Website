import pandas as pd
df = pd.read_csv('powerplant_data.csv')
for col in ['AT', 'V', 'AP', 'RH']:
    print(f"{col}: {df[col].min()} to {df[col].max()}")
