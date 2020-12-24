/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Module Description
 *
 * Description: Automation of clearing franchisee orders   
 * 
 * @Last Modified by:   Sruti Desai
 * 
 */

define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format'],
    function(runtime, search, record, log, task, currentRecord, format) {
        var zee = 0;
        var role = 0;

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://system.sandbox.netsuite.com';
        }

        role = runtime.getCurrentUser().role;

        if (role == 1000) {
            zee = runtime.getCurrentUser().id;
        } else if (role == 3) { //Administrator
            zee = 6; //test
        } else if (role == 1032) { // System Support
            zee = 425904; //test-AR
        }

        var indexInCallback = 0;

        function resetZeeOrders() {
            var ordersSearchResults = loadZeeOrders();
            if (isNullorEmpty(ordersSearchResults)) {
                try {                    
                    console.log('Error to load the zee record with zee_id');
                    return true;
                } catch (error) {
                    if (error instanceof error.SuiteScriptError) {
                        if (error.name == "SSS_MISSING_REQD_ARGUMENT") {
                            console.log('Error to load the zee record with zee_id2');
                        }
                    }
                }
                

            }

            ordersSearchResults.each(function(orderResult) {

                var zeeId = orderResult.getValue('internalid');

                record.submitFields({
                    type: record.Type.PARTNER,
                    id: zeeId,
                    values: {
                        'custentity_mpex_b4': null,
                        'custentity_mpex_c5': null,
                        'custentity_mpex_dl': null,
                        'custentity_mpex_500g': null,
                        'custentity_mpex_1kg': null,
                        'custentity_mpex_3kg': null,
                        'custentity_mpex_5kg': null
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields : true
                    }
                });

                return true;

            });

            
        }

        /**
         * Load the result set of the invoices records linked to the customer.
         * @param   {String}                customer_id
         * @param   {String}                invoice_status
         * @return  {nlobjSearchResultSet}  invoicesResultSet
         */
        function loadZeeOrders() {
            var zeeResultSet;
            var zeeSearch = search.load({
                id: 'customsearch_zee_mpex_product_order',
                type: search.Type.PARTNER
            });
            
            zeeResultSet = zeeSearch.run();
            
            return zeeResultSet;
            
        }

        function isNullorEmpty(val) {
            if (val == '' || val == null) {
                return true;
            } else {
                return false;
            }
        }

        return {
            execute: resetZeeOrders
        }
    });