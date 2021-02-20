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

                $("#process_order").click(function(){
                   alert("Please wait while all active orders are processed");
                   $('.progress').addClass('show');
                   //setTimeout(function(){ processMove(); }, 100);
                });
            });      
        }

        

        function processMove() {
            var currentScript = currentRecord.get();
            var initial_count = currentScript.getValue({fieldId: 'numActive'});
            
            
            console.log("initial", initial_count);
            var totalTime = initial_count*20;
            console.log("total", totalTime);
            var elem = document.getElementById("progress-records");
            var width = 0;
            var id = setInterval(frame, totalTime);
            function frame() {
                if (width >= 95) {
                    clearInterval(id);
                    deleteProgress(initial_count);
                    
                } else {
                    width++;
                    elem.style.width = width + "%";
                    elem.innerHTML = width + "%";
                }
            }
        }
       
        function saveRecord(context) {
            var currentScript = currentRecord.get();
            var date_from = $('#date_from').val();
            var date_to = $('#date_to').val();
            
            if (isNullorEmpty(date_to)) {
                date_to = new Date();
                date_to = formatDate(date_to);   
            }
            
            if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {  
                var parts1 =date_from.split('-');
                var parts2 =date_to.split('-');

                var date1 = new Date(parts1[0], parts1[1] - 1, parts1[2]); 
                var date2 = new Date(parts2[0], parts2[1] - 1, parts2[2]); 

                
                // if (date_to < date_from) {
                //     // alert('Please enter an end date that is after or equal to the starting date');
                //     // return false;
                //     currentScript.setValue({ fieldId: 'date_from', value: date_from });
                //     currentScript.setValue({ fieldId: 'date_to', value: date_to });
                    
                //     return true;
                // } else {
                   
                    currentScript.setValue({ fieldId: 'custpage_date_from', value:  date1});
                    currentScript.setValue({ fieldId: 'custpage_date_to', value: date2 });
                    return true;
                //}

            } else if (isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
                alert('Please select a starting date or remove all date filters and submit search.');
                return false;
            } else {
                
                return true;
            }

            
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