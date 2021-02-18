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

define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format'],
    function(runtime, search, record, log, task, currentRecord, format) {
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

        function resetZeeOrders() {
            log.debug({
                title: 'start',
                details: 'start'
            });
            var zeeIdSet = ctx.getParameter({ name: 'custscript_process_orders' });
            if (isNullorEmpty(zeeIdSet)) {
                zeeIdSet = [];
            } else {
                zeeIdSet = JSON.parse(zeeIdSet);
            }

            log.debug({
                title: 'start',
                details: new Date()
            });
            var zeeSearch = search.load({
                id: 'customsearch_mpex_zee_order_search',
                type: 'customrecord_zee_mpex_order'
            });
            
            zeeSearch.filters.push(search.createFilter({
                name: 'custrecord_mpex_order_status',
                operator: search.Operator.IS,
                values: 1
            }));

            var zeeResultSet = zeeSearch.run();

            zeeResultSet.each(function(searchResult) {
                log.debug({
                    title: 'start2',
                    details: new Date()
                });
                var internalid = searchResult.getValue({ name: 'id'});
                log.debug({
                    title: 'internalid',
                    details: internalid
                })
                var zeeId = searchResult.getValue({ name: 'custrecord_mpex_order_franchisee'}); 
                var status = searchResult.getValue({ name: 'custrecord_mpex_order_status'}); 
                if (status != 1) {
                    return true;
                }
                if (zeeIdSet.indexOf(zeeId) == -1) {
                    zeeIdSet.push(zeeId);
                    var usageLimit = ctx.getRemainingUsage();
                
                    if (usageLimit < 100) {
                        zeeIdSet.pop();
                        var params = {
                            custscript_process_orders: JSON.stringify(zeeIdSet)
                        };
                        var reschedule = task.create({
                            taskType: task.TaskType.SCHEDULED_SCRIPT,
                            scriptId: 'customscript_ss_product_ordering',
                            deploymentId: 'customdeploy_ss_product_ordering',
                            params: params
                        });
                        
                        log.debug({
                            title: 'rescheduling',
                            details: 'rescheduling'
                        })
                        reschedule.submit();
                        
                        return false;
                    } else {
                        var orderRec = record.load({
                            type: 'customrecord_zee_mpex_order',
                            id: internalid,
                        });
        
                        orderRec.setValue({ fieldId: 'custrecord_mpex_order_status', value: 2});
                        orderRec.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });
                        log.debug({
                            title: 'end',
                            details: new Date()
                        });
                    }
                    
                }
                return true;
            });

            log.debug({
                title: 'complete',
                details: 'complete'
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
            execute: resetZeeOrders
        }
    });