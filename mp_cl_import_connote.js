/**
 * 
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * 
 * Description: Import an excel file of connote numbers to add into processed orders
 * @Last Modified by: Sruti Desai
 * 
 */

define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
    function(error, runtime, search, url, record, format, email, currentRecord) {
        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }
        var role = runtime.getCurrentUser().role;

        /**
         * On page initialisation
         */
        function pageInit() {
            
            $(document).ready(function(){

                var currentScript = currentRecord.get();
                if (!isNullorEmpty(currentScript.getValue({fieldId: 'custpage_scheduled'}))) {
                    console.log('started');
                    //$('.progress').addClass('show');
                    setTimeout(function(){ processMove(); }, 100);
                }
                
            });      
        }

        

        function processMove() {
            var currentScript = currentRecord.get();
            var initial_count = currentScript.getValue({fieldId: 'excel_lines'});
            
            console.log("in here");
            console.log("initial", initial_count);
            var totalTime = initial_count*7;
            console.log("total", totalTime);
            var elem = document.getElementById("progress-records");
            var width = 0;
            var id = setInterval(frame, totalTime);
            function frame() {
                if (width >= 95) {
                    clearInterval(id);
                    checkProgress(initial_count);
                    
                } else {
                    width++;
                    elem.style.width = width + "%";
                    elem.innerHTML = width + "%";
                }
            }
        }
       
        function checkProgress() {
            var currentScript = currentRecord.get();
            var activeSearch = search.load({
                id: 'customsearch_mpex_zee_order_search',
                type: 'customrecord_zee_mpex_order'
            });

            activeSearch.filters.push(search.createFilter({
                name: 'formulatext',
                operator: search.Operator.IS,
                values: 2,
                formula: '{custrecord_mpex_order_status}'
            }));

            activeSearch.filters.push(search.createFilter({
                name: 'custrecord_mpex_order_franchisee',
                operator: search.Operator.ANYOF,
                values: currentScript.getValue({fieldId: 'zee_array'})
            }));

            console.log("sdsd");

            if (!isNullorEmpty(currentScript.getValue({fieldId: 'custpage_date_from'})) && !isNullorEmpty(currentScript.getValue({fieldId: 'custpage_date_to'}))) {
                var date_from = currentScript.getValue({fieldId: 'custpage_date_from'});
                var date_to = currentScript.getValue({fieldId: 'custpage_date_to'});

                activeSearch.filters.push(search.createFilter({
                    name: 'custrecord_mpex_order_date',
                    operator: search.Operator.ONORAFTER,
                    values: formatDate(date_from)
                }));
                activeSearch.filters.push(search.createFilter({
                    name: 'custrecord_mpex_order_date',
                    operator: search.Operator.ONORBEFORE,
                    values: formatDate(date_to)
                }));
            } else {
                var today = new Date();
                today.setDate(today.getDate() + 1);
                //Change it so that it is 7 days in the past.
                //var weekAgo = today.getDate() - 6;
                var weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 6);

                today = formatDate(today);
                weekAgo = formatDate(weekAgo);

                activeSearch.filters.push(search.createFilter({
                    name: 'custrecord_mpex_order_date',
                    operator: search.Operator.ONORAFTER,
                    values: weekAgo
                }));
                activeSearch.filters.push(search.createFilter({
                    name: 'custrecord_mpex_order_date',
                    operator: search.Operator.ONORBEFORE,
                    values: today
                }));
            }

            console.log("sdsdsdsd");
            var search_count = activeSearch.runPaged().count;
            console.log(search_count);
            if (search_count != 0) {
                console.log("testing");
                setTimeout(checkProgress, 500);
            } else {
                console.log("abc");
                $(".progress-bar").removeClass("progress-bar-warning");
                $(".progress-bar").addClass("progress-bar-success");
                var elem = document.getElementById("progress-records");   
                elem.style.width = 100 + '%'; 
                elem.innerHTML = 100 * 1  + '%';
                console.log("def");
            }
        }

        function saveRecord(context) {
            var currentScript = currentRecord.get();
            var date_from = $('#date_from').val();
            var date_to = $('#date_to').val();
            
            console.log("Testing", date_from);
            console.log("Testing2", date_to);

            if (isNullorEmpty(date_to) && isNullorEmpty(date_from)) {
                currentScript.setValue({ fieldId: 'custpage_date_from', value:  date_from});
                currentScript.setValue({ fieldId: 'custpage_date_to', value: date_to });
                return true;
            }
            if (isNullorEmpty(date_to) && !isNullorEmpty(date_from)) {
                date_to = new Date();
                date_to = formatDate(date_to); 
                date_to = date_to.replace(/\//g, "-");  
                console.log(date_to);
                

            }
            
            if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {  
                var parts1 =date_from.split('-');
                var parts2 =date_to.split('-');

                var date1 = new Date(parts1[0], parts1[1] - 1, parts1[2]); 
                var date2 = new Date(parts2[0], parts2[1] - 1, parts2[2]); 

                
                if (dateCompare(date1, date2)) {
                    alert('Please enter an end date that is after or equal to the starting date');
                    return false;
                } else if(isNullorEmpty(currentScript.getValue({fieldId: 'upload_mpex_csv'}))) {
                    alert('Please submit a file');
                } else {
                    currentScript.setValue({ fieldId: 'custpage_date_from', value:  date1});
                    currentScript.setValue({ fieldId: 'custpage_date_to', value: date2 });
                    return true;
                }

            } else if (isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
                alert('Please select a starting date or remove all date filters and submit search.');
                return false;
            } else if (isNullorEmpty(currentScript.getValue({fieldId: 'upload_mpex_csv'}))) {
                alert('Please submit a file');
            } else {
                console.log(date_from);
                console.log(date_to);
                return true;
            }

            
        }
       
        function dateCompare(date1, date2){
            return date1 > date2;
        }
        function formatDate(testDate){
            console.log('testDate: '+testDate);
            var responseDate=format.format({value:testDate,type:format.Type.DATE});
            console.log('responseDate: '+responseDate);
            return responseDate;
        }

        /**
         * Used to pass the values of `date_from` and `date_to` between the scripts and to Netsuite for the records and the search.
         * @param   {String} date_iso       "2020-06-01"
         * @returns {String} date_netsuite  "1/6/2020"
         */
        function dateISOToNetsuite(date_iso) {
            var date_netsuite = '';
            if (!isNullorEmpty(date_iso)) {
                var date_utc = new Date(date_iso);
                // var date_netsuite = nlapiDateToString(date_utc);
                var date_netsuite = format.format({
                    value: date_utc,
                    type: format.Type.DATE
                });
                
            }
            return date_netsuite;
        }
        
        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
        };  
    }

    
);