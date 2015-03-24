/* This is the pre code review code */

google.load("visualization", "1", {packages:["corechart"]});

$(document).ready(function(){
    /* Declare the cells and list feeds */
    var cells_feed = "https://spreadsheets.google.com/feeds/cells/13_SwbEnTeqwJqTR436ggeEfOX28YmACR995INGIL63M/1/public/values?alt=json";
    var list_feed = "https://spreadsheets.google.com/feeds/list/13_SwbEnTeqwJqTR436ggeEfOX28YmACR995INGIL63M/1/public/values?alt=json";
    var questions = [];

    /* Get our cells json */
    $.get(cells_feed, function(data){

        /* Loop through the cells json and build the questions object */
        $.each(data.feed.entry, function(index, entry){

            if(entry.gs$cell.row === "1"){
                questions.push({
                    "key":entry.content.$t.replace(/ /g, '').replace('?', '').replace("'", '').toLowerCase(),
                    "display":entry.content.$t,
                    "results":[]
                });
            }
            else {
                return false;
            }

        });

        /* Now, get our list json */
        $.get(list_feed, function(data){

            /* Loop through the list json to populate our results for each question */
            $.each(data.feed.entry, function(index, entry){

                /* Loop through each entry */
                $.each(entry, function(key, val){

                    if(key.substr(0, 4) === 'gsx$'){
                        for(var i = 0; i < questions.length; i++){
                            if(questions[i].key === key.replace('gsx$', '')){
                                questions[i].results.push(val.$t);
                            }
                        }
                    }

                });

            });

            /* Let's see what's in the questions collection */
            console.log(questions);

            /* BEGIN THE AGE CHART */
            /* https://developers.google.com/chart/interactive/docs/gallery/piechart */
            /* Get the age results object */
            var age = questions.filter(function(item){
                return item.key === 'age';
            });

            /* Create an array to hold our data */
            var agedata = [ ['Age', 'Range'] ];
            
            /* Create a summary object to sum up each answer's occurrences */
            var agesummary = {};

            age[0].results.filter(function(result){
                agesummary[result] = (agesummary[result] || 0) + 1;
            });

            /* Build a data array of arrays because the Google chart expects an array of arrays */
            for(var key in agesummary){
                if(agesummary.hasOwnProperty(key)) {
                    agedata.push([key, agesummary[key]]);
                }
            }

            /* Convert our data to a google datatable */
            var agetable = google.visualization.arrayToDataTable(agedata);

            /* Create a chart configuration object */
            var ageoptions = {
                title:age[0].display
            };

            /* Initialize our new chart */
            var agechart = new google.visualization.PieChart(document.getElementById('age_chart'));

            /* Draw our age chart */
            agechart.draw(agetable, ageoptions);

            /* END THE AGE CHART */

            /* ---------------------------------------------------- */

            /* BEGIN THE GENDER CHART */
            /* https://developers.google.com/chart/interactive/docs/gallery/piechart */
            /* Get the age results object */
            var gender = questions.filter(function(item){
                return item.key === 'gender';
            });

            /* Create an array to hold our data */
            var genderdata = [ ['Gender', 'Range'] ];

            /* Create a summary object to sum up each answer's occurrences */
            var gendersummary = {};

            gender[0].results.filter(function(result){
                gendersummary[result] = (gendersummary[result] || 0) + 1;
            });

            /* Build a data array of arrays because the Google chart expects an array of arrays */
            for(var key in gendersummary){
                if(gendersummary.hasOwnProperty(key)) {
                    genderdata.push([key, gendersummary[key]]);
                }
            }

            /* Convert our data to a google datatable */
            var gendertable = google.visualization.arrayToDataTable(genderdata);

            /* Create a chart configuration object */
            var genderoptions = {
                title:gender[0].display
            };

            /* Initialize our new chart */
            var genderchart = new google.visualization.PieChart(document.getElementById('gender_chart'));

            /* Draw our age chart */
            genderchart.draw(gendertable, genderoptions);

            /* END THE GENDER CHART */

            /* ---------------------------------------------------- */

            /* BEGIN THE BAR CHART */
            /* https://developers.google.com/chart/interactive/docs/gallery/barchart */
            /* Get the age results object */
            var lovejs = questions.filter(function(item){
                return item.key === 'howmuchdoyoulovejavascript';
            });

            /* Create an array to hold our data */
            var lovejsdata = [ ['How much do you love javascript?', 'Range', { role:'style' }] ];

            /* Create a summary object to sum up each answer's occurrences */
            var lovejssummary = {};

            lovejs[0].results.filter(function(result){
                lovejssummary[result] = (lovejssummary[result] || 0) + 1;
            });

            /* Build a data array of arrays because the Google chart expects an array of arrays */
            for(var key in lovejssummary){
                if(lovejssummary.hasOwnProperty(key)) {
                    lovejsdata.push([key, lovejssummary[key], 'fill-color:#C5A5CF;fill-opacity:0.4']);
                }
            }

            /* Convert our data to a google datatable */
            var lovejstable = google.visualization.arrayToDataTable(lovejsdata);

            /* Create a chart configuration object */
            var lovejsoptions = {
                title:gender[0].display,
                legend: { position:"none" }
            };

            /* Initialize our new chart */
            var lovejschart = new google.visualization.BarChart(document.getElementById('howmuchdoyoulovejavascript_chart'));

            /* Draw our age chart */
            lovejschart.draw(lovejstable, lovejsoptions);

            /* END THE BAR CHART */

            /* ---------------------------------------------------- */

            /* BEGIN THE TABLE */

            var timestamp,
                comments,
                email,
                headers,
                rows;

            timestamp = questions.filter(function(item){
                return item.key === 'timestamp';
            });

            /* We want the first object */
            timestamp = timestamp[0];

            comments = questions.filter(function(item){
                return item.key === 'wanttoshareanythingelse';
            });
            comments = comments[0];

            email = questions.filter(function(item){
                return item.key === 'whatsyouremail';
            });
            email = email[0];

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

            /* END THE TABLE */

        });

    });



});