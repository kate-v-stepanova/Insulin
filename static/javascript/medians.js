$(document).ready(function() {

    var series = $('#plot').attr('data-series').replace(/'/g, '"'); //");
    series = JSON.parse(series);
    var batches = $('#plot').attr('data-batches').replace(/'/g, '"'); //");
    batches = JSON.parse(batches);
    var colors = ['#058DC7', '#50B432', '#DDDF00', '#ED561B', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4']
    var chart = Highcharts.chart('plot', {
        colors: colors,
        chart: {
            type: 'column'
        },
        title: {
            text: 'Filtrationsverhalten'
        },
        xAxis: {
            categories: batches,
        },
        series: series,

        tooltip: {
            headerFormat: "{point.Batch}<br>",
            pointFormat: '<b>Batch: </b>{point.category}<br><b>Strasse: </b>{series.name}<br><b>Wirkstoffmenge: </b>{point.Wirkstoff}<br><b>Filtrationsverhalten: </b>{point.y}<br>click to see details'
        },

        plotOptions: {

            series: {
                allowPointSelect: true,
                pointWidth: 10,
                cursor: 'pointer',
                events: {
                    click: function(e) {
                        var batch = e.point.Batch;
                        var strasse = e.point.Strasse;
                        var url = window.location.href + "/get_batch_data/" + batch + '_' + strasse;
                        $.ajax({
                            type: "POST",
                            url: url,
                            dataType: 'json',
                            contentType: 'application/json',
                        }).done(function(response) {
                            $('#batch_table').removeClass('d-none');
                            var batch_data = response;

                            // define badge color (= Strasse)
                            var badge_color = 'badge-secondary';
                            if (strasse == 'A') {
                                badge_color = 'badge-primary'
                            } else if (strasse == 'B') {
                                badge_color = 'badge-success'
                            } else if (strasse == 'C') {
                                badge_color = 'badge-warning'
                            } // if secondary: something is wrong. Check Strasse.

                            for (const param in batch_data) {
                                var val = batch_data[param];
                                var clean_param = param.replace(/\ /g, '_'); //");
                                clean_param = clean_param.replace(/'/g, ''); //");
                                clean_param = clean_param.replace(/\//g,'_');//\//");))
                                clean_param = clean_param.replace('%', 'perc');


                                $('#'+clean_param).text(val);
                                $('#'+clean_param).removeClass('badge-primary').removeClass('badge-success').removeClass('badge-warning');
                                $('#'+clean_param).addClass(badge_color);
                            }
                            $('#BatchID').text(batch);
                            $('#batch').text(batch + '_' + strasse + ': ' + batch_data['Filtrationsverhalten']);
                        });
                    }
                }
            }
        }

   });

    $('#add_param').click(function() {
        var param = $('#select_param').val();
        var clean_param = param.replace(/\ /g, '_'); //");
        clean_param = clean_param.replace(/'/g, ''); //");
        clean_param = clean_param.replace(/\//g,'_');//"));
        clean_param = clean_param.replace('%', 'perc');//");
        clean_param = clean_param.replace('[', '');
        clean_param = clean_param.replace(']', '');
        $('#div-'+clean_param).removeClass('d-none');
        $('#select_param option:selected').attr('disabled', 'disabled');
        $('#predict').removeClass('d-none');
    });

    $('.delete_param').click(function() {
        var clean_param = $(this).closest('div.row').find('input').attr('name').trim().replace('slider-', '');
        $(this).closest('div.row').addClass('d-none');
        $('#option-'+clean_param).removeAttr('disabled');
    });

    $('.slider').on('input change', function() {
        $(this).closest('div.row').find('span').text($(this).val());
    });

    $('input#slider-Strasse').on('input change', function() {
        var val = $(this).val();
        var dict = {'1': 'A', '2': 'B', '3': 'C'};
        $(this).closest('div.row').find('span').text(dict[val]);
    });

    $('#predict').click(function() {
        var data = {};
        var BatchID = $('span#BatchID').text().trim();
        var Strasse = $('span#Strasse').text().trim();
        var sliders = $('input.slider:visible');
        var selected_params = {'BatchID': BatchID, 'prev_Strasse': Strasse};
        for (i=0; i<sliders.length; i++) {
            var slider = sliders[i];
            var val = $(slider).val();
            var clean_param = $(slider).attr('id').replace('slider-', '');
            var param = $('option#option-'+clean_param).val();
            selected_params[param] = val;
        }
        var url = window.location.href + "/predict/"
        $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(selected_params),
            dataType: 'json',
            contentType: 'application/json',
        }).done(function(response) {
            console.log(response);
            $('#predicted_title').removeClass('d-none');
            $('#predicted').text(response['Filtrationsverhalten']);

        });
    });

});