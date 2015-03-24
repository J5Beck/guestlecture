/* This is post code review. Could be improved more but for this exercise, this is much better */

google.load("visualization", "1", {packages:["corechart"]});

$(document).ready(function(){

    /* Declare cells feed, list feed and a questions container */
    var cells_feed = "https://spreadsheets.google.com/feeds/cells/13_SwbEnTeqwJqTR436ggeEfOX28YmACR995INGIL63M/1/public/values?alt=json";
    var list_feed = "https://spreadsheets.google.com/feeds/list/13_SwbEnTeqwJqTR436ggeEfOX28YmACR995INGIL63M/1/public/values?alt=json";
    var questions = [];

    /* Kick things off with a call to get the cells feed data.
     * Process that data to build the questions array.
     * Then call the list feed to process answers and build the
     * charts.
     */
    $.get(cells_feed)
        .done(function(data){
            processQuestions(data);

            $.get(list_feed)
                .done(function(data){
                    processList(data);
                    drawCharts();
                });
        });


    function processQuestions(data){

        /* Add each question as an object in the questions collection */
        $.each(data.feed.entry, function(index, entry){

            /* This is a magic number. All question display names are in the first row of columns */
            if(entry.gs$cell.row === "1"){
                questions.push({
                    "key":entry.content.$t.replace(/\W/g, '').toLowerCase(),
                    "display":entry.content.$t,
                    "results":[]
                });
            }
            else {
                /* Break out of the loop so that we don't iterate through all entry objects */
                return false;
            }

        });
    }

    function processList(data){

        $.each(data.feed.entry, function(index, entry){

            $.each(entry, function(key,val){

                /* Loop through the results and push them to the results array for each question object */
                if(key.substr(0,4) === "gsx$"){
                    for(var i = 0; i < questions.length; i++){
                        if(questions[i].key === key.replace('gsx$', '')){
                            questions[i].results.push(val.$t);
                        }
                    }
                }

            });

        });

    }

    function drawCharts(){

        /* This breaks the single responsibility principle.
         * Each of these calls should be made separately so that
         * this function is not responsible for so much.
         */
        console.log(questions); /* Let's see what's in the questions collection */
        drawPieChart('age');
        drawPieChart('gender');
        drawBarChart('howmuchdoyoulovejavascript');
        drawTable();
    }

    function drawPieChart(question){

        var q,
            data = [],
            summary = {},
            datatable,
            options,
            chart;

        /* Get the question from the questions collection based on the question passed in */
        q = getQuestion(question);

        /* Add the chart header to the data collection. This will be used to label the chart that is rendered */
        data.push([q.display, '']);

        /* Tally up the results and store them in the summary */
        q.results.filter(function(result){
            summary[result] = (summary[result] || 0) + 1;
        });

        /* Loop through the summary and build the data array of arrays.
         * Google wants a "datatable" which is an array of arrays.
         * Using a for loop because javascript doesn't have a map function
         * for objects (which kinda sucks).
         */
        for (var key in summary) {
            if (summary.hasOwnProperty(key)) {
                data.push([key, summary[key]]);
            }
        }

        /* Initialize datatable as a google datatable */
        datatable = google.visualization.arrayToDataTable(data);

        /* Options is an object that we can pass to Google charts to config our chart
         * These could very easily be data attributes on the DOM element that is meant
         * to render the cart.
         */
        options = {
            title: q.display,
            height:400,
            is3D:true
        };

        /* Initialize our new chart */
        chart = new google.visualization.PieChart(document.getElementById(question.toLowerCase() + '_chart'));

        /* Draw our chart */
        chart.draw(datatable, options);

    }

    function drawBarChart(question){

        var q,
            data = [],
            summary = {},
            datatable,
            options,
            chart;

        /* Get the question object from the questions collection */
        q = getQuestion(question);

        /* Add the chart header to the data collection */
        data.push([q.display, '', { role:'style' }]);

        /* Tally up the results and store them in the summary */
        q.results.filter(function(result){
            summary[result] = (summary[result] || 0) + 1;
        });

        /* Loop through the summary and build the data array of arrays.
         * Google wants a "datatable" which is an array of arrays.
         */
        for (var key in summary) {
            if (summary.hasOwnProperty(key)) {
                data.push([key, summary[key], 'fill-color:#C5A5CF;fill-opacity:0.4']);
            }
        }

        /* Initialize datatable as a google datatable */
        datatable = google.visualization.arrayToDataTable(data);

        /* Options is an object that we can pass to Google charts to config our chart */
        options = {
            title: q.display,
            legend: { position:"none" }
        };

        /* Initialize our new chart */
        chart = new google.visualization.BarChart(document.getElementById(question.toLowerCase() + '_chart'));

        /* Draw our chart */
        chart.draw(datatable, options);

    }

    function drawTable(){

        /* We're building a basic table here.
         * There are lots of ways to do this string building
         * but the for loop += is actually the fastest.
         * http://jsperf.com/join-concat/2
         * Also, don't iteratively add to the DOM as that causes repaints.
         * Build the whole bit and add it all at once.
         */
        var timestamp,
            comments,
            email,
            headers,
            rows;

        timestamp = getQuestion('timestamp');
        comments = getQuestion('wanttoshareanythingelse');
        email = getQuestion('whatsyouremail');

        headers  = '<tr>';
        headers += '<th>' + timestamp.display + '</th>';
        headers += '<th>' + comments.display + '</th>';
        headers += '<th>' + email.display + '</th>';
        headers += '</tr>';

        for(var i = 0; i < timestamp.results.length; i++){
            rows += '<tr>';
            rows += '<td>'+ timestamp.results[i] +'</td>';
            rows += '<td>'+ comments.results[i] +'</td>';
            rows += '<td>'+ email.results[i] +'</td>';
            rows += '</tr>';
        }

        /* We only have one table but if we add more, we need id's to target the right ones */
        $('thead').append(headers);
        $('tbody').append(rows);

    }

    function getQuestion(key){

        /* This is a simple function to get a question from the collection based on key */
        var question = questions.filter(function(item){
            return item.key === key.toLowerCase();
        });

        return question[0];

    }


});