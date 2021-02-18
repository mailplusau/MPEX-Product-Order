/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Module Description
 *
 * Description: Sets status of all active orders to 2/"Processed"   
 * 
 * @Last Modified by:   Sruti Desai
 * 
 */
define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format', 'N/file'],
    function(runtime, search, record, log, task, currentRecord, format, file) {
        var zee = 0;
        var role = 0;
        var ctx = runtime.getCurrentScript();
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

        function main() {

            log.debug({
                title: 'start',
                details: 'start'
            });
            var file_id = runtime.getCurrentScript().getParameter({ name: 'custscript_import_connote_file_id' });
            var index = runtime.getCurrentScript().getParameter({ name: 'custscript_import_connote_index' });


            log.debug({
                title: 'fileid',
                details: file_id
            });

            var file1 = file.load({
                id: file_id
            });

            var iterator = file1.lines.iterator();

            // skip first line (header)
            iterator.each(function (line) { 
                log.debug({ title: 'line', details: line });
                return false;
            });

            if (isNullorEmpty(index)) {
                index = 0;
            } 

            var counter = 0;
            iterator.each(function (line) {
                if (index != index) {
                    counter++;
                    return true;
                }
                //regex to split excel line into values
                var csv_values = line.value.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                var zee_id = csv_values[1];
                var toll_acc = csv_values[2];
                var total = csv_values[9];
                var postcode = csv_values[13];
                var connote = csv_values[14];

                addConnote(zee_id, toll_acc, total, postcode, connote, counter, file_id);
                counter++;
                return true;
            });
            
            log.debug({
                title: 'complete',
                details: 'complete'
            });
            
        }

        function addConnote(zee_id, toll_acc, total, postcode, connote, counter, f_id) {
            var zeeSearch = search.load({
                id: 'customsearch_mpex_zee_order_search',
                type: 'customrecord_zee_mpex_order'
            });

            log.debug({
                title: 'zee',
                details: parseInt(zee_id)
            });

            zeeSearch.filters.push(search.createFilter({
                name: 'custrecord_mpex_order_franchisee',
                operator: search.Operator.IS,
                values: parseInt(zee_id)
            }));

            var zeeResultSet = zeeSearch.run();

            zeeResultSet.each(function(searchResult) {
                
                var internalid = searchResult.getValue({ name: 'id'});
                var zeeId = searchResult.getValue({ name: 'custrecord_mpex_order_franchisee'}); 
                var status = searchResult.getValue({ name: 'custrecord_mpex_order_status'}); 
                var connoteSearch = searchResult.getValue({ name: 'custrecord_mpex_order_connote'}); 
                var toll = searchResult.getValue({ name: 'custrecord_mpex_order_toll_acc_num'}); 

                if (status != 2 || toll.indexOf(toll_acc) == -1 || zeeId.indexOf(zee_id) == -1 || !isNullorEmpty(connoteSearch)) {
                    return true;
                }
                log.debug({
                    title: 'status',
                    details: status
                });

                var usageLimit = ctx.getRemainingUsage();
            
                if (usageLimit < 100) {

                    var params = {
                        custscript_import_connote_file_id: f_id,
                        custscript_import_connote_index: counter
                    };

                    var reschedule = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: 'customscript_ss_import_connote',
                        deploymentId: 'customdeploy_ss_import_connote',
                        params: params
                    });
                    
                    reschedule.submit();
                    
                    return false;
                } else {
                    var orderRec = record.load({
                        type: 'customrecord_zee_mpex_order',
                        id: internalid,
                    });
                    
                    orderRec.setValue({ fieldId: 'custrecord_mpex_order_status', value: 3});
                    orderRec.setValue({ fieldId: 'custrecord_mpex_order_connote', value: connote});

                    orderRec.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });                  
                    
                }
                    
                
                return true;
            });

        }
        function isNullorEmpty(val) {
            if (val == '' || val == null) {
                return true;
            } else {
                return false;
            }
        }

        return {
            execute: main
        }
    });