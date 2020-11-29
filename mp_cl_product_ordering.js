/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */

define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
    function(error, runtime, search, url, record, format, email, currentRecord) {
        // var baseURL = 'https://1048144.app.netsuite.com';
        // if (runtime.EnvType == "SANDBOX") {
        //     baseURL = 'https://1048144-sb3.app.netsuite.com';
        // }
        var role = runtime.getCurrentUser().role;

        /**
         * On page initialisation
         */
        function pageInit() {
            //var id = 779884;
             if (role != 1000) {
                 id = $('#zee_dropdown option:selected').val();
                 console.log("zee chosen" + id);
            //     // $('#zee_dropdown').change(function() {
            //     //     $('div.col-xs-12.mpex_order_table_div').html(resultsTable(id));
            //     // });
            // } else {
             }
            // $('#zee_dropdown').change(function() {
            //     console.log("zeeee " + $('#zee_dropdown option:selected').val());
            //$('div.col-xs-12.mpex_order_table_div').html(resultsTable());
                //     //     $('div.col-xs-12.mpex_order_table_div').html(resultsTable(id));
            //});
            

               
        }

        function saveRecord(context) {
            if (window.confirm('Are you sure you want to submit your order?')){
                var b4 = checkNull($('#b4_text').val());
                var c5 = checkNull($('#c5_text').val());
                var dl = checkNull($('#dl_text').val());
                var g500 = checkNull($('#500g_text').val());
                var kg1 = checkNull($('#1kg_text').val());
                var kg3 = checkNull($('#3kg_text').val());
                var kg5 = checkNull($('#5kg_text').val());

                //var zee_id = 779884;
                //zee_id = runtime.getCurrentUser().id; //Get Franchisee ID-- REMOVE TO TEST
                var zee_id = '';
                if (role != 1000) {
                    zee_id = $('#zee_dropdown option:selected').val();
                    var val1 = currentRecord.get();
                    val1.setValue({
                        fieldId: 'custpage_zee_selected',
                        value: zee_id
                    });
                    console.log("zee selected" + zee_id);
                    
                } else {
                    zee_id = runtime.getCurrentUser().id; //Get Franchisee ID-- REMOVE TO TEST
                }

                record.submitFields({
                    type: record.Type.PARTNER,
                    id: zee_id,
                    values: {
                        'custentity_mpex_b4': b4,
                        'custentity_mpex_c5': c5,
                        'custentity_mpex_dl': dl,
                        'custentity_mpex_500g': g500,
                        'custentity_mpex_1kg': kg1,
                        'custentity_mpex_3kg': kg3,
                        'custentity_mpex_5kg': kg5
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields : true
                    }
                });
                

            } else {
                return false;
            }
             
            return true;
        }
        
        
        function onclick_back() {   
            //window.history.back();
            history.go(-1);
        }


        function checkNull(value) {
            if (isNullorEmpty(value)) {
                return 0;
            }
            return value;
        }

        function onclick_submit() {
            //var urlVar = "https://1048144-sb3.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1067&deploy=1";
            var urlVar = "https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1089&deploy=1";

            console.log(urlVar);

            window.location.href = urlVar;
        }

        
        function formatDate(testDate){
            console.log('testDate: '+testDate);
            var responseDate=format.format({value:testDate,type:format.Type.DATE});
            console.log('responseDate: '+responseDate);
            return responseDate;
        }


    
      

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            onclick_back: onclick_back,
            onclick_submit: onclick_submit,
        };  
    }

    
);