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
                details: new Date()
            });
            
            var file_id = runtime.getCurrentScript().getParameter({ name: 'custscript_import_connote_file_id' });
            var index = runtime.getCurrentScript().getParameter({ name: 'custscript_import_connote_index' });
            var date_from = runtime.getCurrentScript().getParameter({ name: 'custscript_import_connote_date_from' });
            var date_to = runtime.getCurrentScript().getParameter({ name: 'custscript_import_connote_date_to' });          

            log.debug({
                title: 'datefrom',
                details: date_from
            });

            log.debug({
                title: 'dateto',
                details: date_to
            });

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
                if (counter != index) {
                    counter++;
                    return true;
                }
                //regex to split excel line into values
                var csv_values = line.value.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                var zee_id = csv_values[1];
                var toll_acc = csv_values[2];
                var total = csv_values[13];
                var postcode = csv_values[17];
                var connote = csv_values[18];

                addConnote(zee_id, toll_acc, total, postcode, connote, counter, file_id, date_from, date_to);
                index++;
                counter++;
                return true;
            });
            
            log.debug({
                title: 'complete',
                details: new Date()
            });
            
        }

        function addConnote(zee_id, toll_acc, total, postcode, connote, counter, f_id, date_from, date_to) {
            log.debug({
                title: 'starttt',
                details: new Date()
            });
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

            zeeSearch.filters.push(search.createFilter({
                name: 'formulatext',
                operator: search.Operator.IS,
                values: 2,
                formula: '{custrecord_mpex_order_status}'
            }));

            log.debug({
                title: date_from,
                details: date_to
            })
            if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
                zeeSearch.filters.push(search.createFilter({
                    name: 'lastmodified',
                    operator: search.Operator.ONORAFTER,
                    values: date_from
                }));
                zeeSearch.filters.push(search.createFilter({
                    name: 'lastmodified',
                    operator: search.Operator.ONORBEFORE,
                    values: date_to
                }));
            } else {
                //Get today's date using the JavaScript Date object.
                var today = new Date();
                today.setDate(today.getDate() + 1);
                //Change it so that it is 7 days in the past.
                //var weekAgo = today.getDate() - 6;
                var weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 6);

                today = formatDate(today);
                weekAgo = formatDate(weekAgo);
                log.debug({
                    title: today,
                    details: weekAgo
                });
                zeeSearch.filters.push(search.createFilter({
                    name: 'lastmodified',
                    operator: search.Operator.ONORAFTER,
                    values: weekAgo
                }));
                zeeSearch.filters.push(search.createFilter({
                    name: 'lastmodified',
                    operator: search.Operator.ONORBEFORE,
                    values: today
                }));
            }
            var zeeResultSet = zeeSearch.run();

            zeeResultSet.each(function(searchResult) {
                
                var internalid = searchResult.getValue({ name: 'id'});
                var zeeId = searchResult.getValue({ name: 'custrecord_mpex_order_franchisee'}); 
                var status = searchResult.getValue({ name: 'custrecord_mpex_order_status'}); 
                var connoteSearch = searchResult.getValue({ name: 'custrecord_mpex_order_connote'}); 
                var toll = searchResult.getValue({ name: 'custrecord_mpex_order_toll_acc_num'}); 
                log.debug({
                    title: 'in',
                    details: 'in'
                });
                log.debug({
                    title: 'toll',
                    details: toll
                });
                log.debug({
                    title: 'toll_acc',
                    details: toll_acc
                });
                log.debug({
                    title: 'zeeId',
                    details: zeeId
                });
                log.debug({
                    title: 'zee_id',
                    details: zee_id
                });
                log.debug({
                    title: 'connoteSearch',
                    details: connoteSearch
                });
                if (toll.indexOf(toll_acc) == -1 || zeeId.indexOf(zee_id) == -1 || !isNullorEmpty(connoteSearch)) {
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
                        custscript_import_connote_index: counter,
                        custscript_import_connote_date_from: date_from,
                        custscript_import_connote_date_to: date_to
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

            log.debug({
                title: 'enddd',
                details: new Date()
            });
        }

        function formatDate(testDate){
            var responseDate=format.format({value:testDate,type:format.Type.DATE});
            return responseDate;
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