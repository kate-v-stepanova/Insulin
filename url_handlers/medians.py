from flask import Blueprint, render_template, request
import json
from sklearn.linear_model import LinearRegression

medians = Blueprint('medians', __name__)


@medians.route('/medians', methods=['GET', 'POST'])
def get_medians():
    from main import get_data2
    df = get_data2()
    params = df.columns.tolist()

    # get min & max values
    min_max = {'Strasse': {'min': 1, 'max': 3}}
    for param in params:
        try:
            min_val = df[param].min()
            max_val = df[param].max()
            min_max[param] = {'min': min_val, 'max': max_val}
        except:
            continue

    min_max['Strasse'] = {'min': 1, 'max': 3}
    print(min_max)

    df['Batch'] = df['BatchID'].str[:-3]
    df['Wirkstoff'] = df['Gesamtmenge Wirkstoff in kg']
    df = df[['Batch', 'Strasse', 'Wirkstoff', 'Filtrationsverhalten']]
    df['y'] = df['Filtrationsverhalten'].astype(float)
    df = df.fillna(0)
    batches = df['Batch'].unique().tolist()
    groups = df.groupby('Batch').size().reset_index()
    tryp3 = groups.loc[groups[0] != 3]
    for batch in tryp3['Batch']:
        batch_df = df.loc[df['Batch'] == batch]
        if 'A' not in batch_df['Strasse'].tolist():
            strasse = 'A'
        elif 'B' not in batch_df['Strasse'].tolist():
            strasse = 'B'
        else:
            strasse = 'C'
        df = df.append({'Batch': batch, 'Strasse': strasse, 'y': 0, 'Wirkstoff': 0, 'Filtrationsverhalten': 0}, ignore_index=True)
    df = df.sort_values(by=['Batch', 'Strasse'])
    series = []
    for strasse in ['A', 'B', 'C']:
        df1 = df.loc[df['Strasse'] == strasse]
        series.append({'name': strasse, 'data': df1.to_dict('records')})
    for serie in series:
        serie['states'] = {'select': {'color': 'red'}}

    series = json.dumps(series)


    return render_template("medians.html", batches=batches, params=params, series=series, min_max=min_max)


@medians.route('/medians/get_batch_data/<batch_id>', methods=['POST'])
def get_batch_data(batch_id):
    from main import get_data2
    df = get_data2()
    batch, strasse = batch_id.split('_')
    batch_info = df.loc[(df['BatchID'].str[:-3] == batch) & (df['Strasse'] == strasse)]
    batch_info = batch_info.to_dict('records')[0] if len(batch_info) != 0 else {}
    return json.dumps(batch_info)

@medians.route('/medians/predict/', methods=['POST'])
def predict():
    from main import get_data2
    df = get_data2()
    data = json.loads(request.data)
    cur_batch = df.loc[(df['BatchID'].str[:-3] == data['BatchID']) & (df['Strasse'] == data['prev_Strasse'])]
    Y_params = ['Filtrationsverhalten']
    X_params = []
    for param in data.keys():
        if param == 'BatchID':
            continue
        if param in cur_batch:
            cur_batch[param] = data[param]
            X_params.append(param)
    df_test = cur_batch
    df_train = df[X_params+Y_params].dropna()

    model = LinearRegression()
    fit_model = model.fit(df_train[X_params], df_train[Y_params])
    predicted = model.predict(df_test[X_params])[0]
    data['Filtrationsverhalten'] = round(predicted[0], 2)

    return json.dumps(data)
