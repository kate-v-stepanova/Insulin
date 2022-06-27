from flask import Blueprint, render_template, request
from sklearn.linear_model import LinearRegression
import numpy as np

line_plot = Blueprint('line_plot', __name__)


@line_plot.route('/line_plot', methods=['GET', 'POST'])
def get_line_plot():
    from main import get_data
    cols = get_data(cols_only=True)
    min_date = "17.02.2015"
    max_date = "20.01.2022"
    if request.method == 'POST':
        date_range = request.form.get('date_range')
        y_axis = request.form.get('y_axis')
        date_range = date_range.replace('/', '.')
        df = get_data()
        start_date = end_date = ''
        if date_range != '':
            start_date, end_date = date_range.split(' - ')
            start_year = int(start_date.split('.')[-1])
            start_month = int(start_date.split('.')[1])
            start_day = int(start_date.split('.')[0])
            end_year = int(end_date.split('.')[-1])
            end_month = int(end_date.split('.')[1])
            end_day = int(end_date.split('.')[0])
            # df = df.loc[(df['year'] >= start_year) & (df['year'] <= end_year) &\
            #             (df['month'] >= start_month) & (df['month'] <= end_month) &\
            #             (df['day'] >= start_day) & (df['day'] <= end_day)]
            df = df.loc[(df['year'] >= start_year) & (df['year'] <= end_year)]

        df = df[['date', y_axis]]
        df.columns = ['x', 'y']

        print(request.form)
        apply_filters = request.form.get('apply_filters') == 'apply_filters' # on / None
        print(apply_filters)
        filter_by = request.form.get('filter_by')  # raw_value / std_dev / None
        print(filter_by)
        max_value = min_value = std_dev = 0
        dates = df['x'].tolist()
        # # Linear Regression
        # X = np.array(df.index.tolist()).reshape(-1, 1)  # values converts it into a numpy array
        # Y = np.array(df['y']).reshape(-1, 1)  # -1 means that calculate the dimension of rows, but have 1 column
        # linear_regressor = LinearRegression()  # create object for the class
        # linear_regressor.fit(X, Y)  # perform linear regression
        # Y_pred = linear_regressor.predict(X)  # make predictions
        # Y_pred = Y_pred.reshape(-1)
        # lin_reg_series = {'name': 'Linear Regression', 'data': Y_pred.tolist(), 'showInLegend': 'false'}
        if apply_filters:
            if filter_by == 'raw_value':
                max_value = request.form.get('max_value')
                min_value = request.form.get('min_value')
                df_filtered = df.loc[(df['y'] < float(min_value)) | (df['y'] > float(max_value))]
                empty_points = df_filtered.index
                df.loc[empty_points, 'y'] = 'null'
                series_1 = {'name': y_axis, 'data': df['y'].tolist()}
                df['y'] = 'null'
                df.loc[df_filtered.index, 'y'] = df_filtered['y']
                series_2 = {'name': 'Outliers', 'data': df['y'].tolist(), 'type': 'scatter'}
                dates = df['x'].tolist()
                series = [series_1, series_2]
            elif filter_by == 'std_dev':
                std_dev = request.form.get('std_dev')
                std_y = df['y'].std()
                series = [{'name': y_axis, 'data': df['y'].tolist()}]
        else:
            series = [{'name': y_axis, 'data': df['y'].tolist()}]
        # series.append(lin_reg_series)

        return render_template('line_plot.html', start_date=start_date, end_date=end_date,
                               min_date=min_date, max_date=max_date, cols=cols, y_axis=y_axis,
                               series=series, dates=dates, apply_filters=apply_filters, filter_by=filter_by,
                               max_value=max_value, min_value=min_value, std_dev=std_dev)
    return render_template('line_plot.html', cols=cols, min_date=min_date, max_date=max_date)