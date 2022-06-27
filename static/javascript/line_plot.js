$(document).ready(function() {


    // close error message
    $('span.close').on('click', function() {
        $(this).parent().parent().parent().addClass('d-none');
    });

    // initialize multiselect
    var samples = new Choices('#y_axis', {
        removeItems: true,
        removeItemButton: true,
        noChoicesText: "Nothing to select",
        maxItemCount: 1,
    });


    var min_date = $('#date_range').attr('min_date');
    var max_date = $('#date_range').attr('max_date');
    var start_date = $('#date_range').attr('start_date');
    var end_date = $('#date_range').attr('end_range');

    $('#date_range').daterangepicker({
        autoUpdateInput: false,
        locale: {
          cancelLabel: 'Clear'
        },
        startDate: start_date,
        endDate: end_date,
//        minDate: min_date,
//        maxDate: max_date,
    });
    $('#date_range').on('apply.daterangepicker', function(ev, picker) {
      $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
    });

      $('#date_range').on('cancel.daterangepicker', function(ev, picker) {
          $(this).val('');
      });

    // Display filters
    $(document).on('change', '#apply_filters', function() {
        if(this.checked) {
          $('#data_filters').removeClass('d-none');
        } else {
            $('#data_filters').addClass('d-none');
            $('#raw_value_div').addClass('d-none');
            $('#std_dev_div').addClass('d-none');
        }
    });

    // Filter By
    //// raw values
    $(document).on('click', '#raw_value', function() {
      $('#raw_value_div').removeClass('d-none');
      $('#std_dev_div').addClass('d-none');
    });
    //// std dev
    $(document).on('click', '#std_dev', function() {
        $('#std_dev_div').removeClass('d-none');
        $('#raw_value_div').addClass('d-none');
    });

    if ($('#line_plot').length != 0) {
      var series = $('#line_plot').attr('series').replace(/'/g, '"'); //");
      series = JSON.parse(series);
      console.log(series)
      var dates = $('#line_plot').attr('dates').replace(/'/g, '"'); //");
      dates = JSON.parse(dates);
      var y_axis = $('#y_axis').attr('y_axis');
      var chart = Highcharts.chart('line_plot', {
            title: {
                text: 'Distribution of ' + y_axis + ' over time',
            },
            xAxis: {
                categories: dates,
            },
            yAxis: {
                title: {
                    text: y_axis,
                }
            },
            tooltip: {
                formatter: function () {
                    return '<b>Date: </b>' + this.x + '<br><b>Value: </b>' + this.y;
                }
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: true,
                        radius: 3
                    },
                    connectNulls: true
                }
            },
            series: series,
        });
    }
})