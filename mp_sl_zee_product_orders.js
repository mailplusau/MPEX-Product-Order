/**
 
 *@NApiVersion 2.0
 *@NScriptType Suitelet

 */

define(['N/ui/serverWidget', 'N/runtime', 'N/log', 'N/task'], 
    function(ui, runtime, log, task) {
        var role = runtime.getCurrentUser().role;
        function onRequest(context) {  
            
            if (context.request.method === 'GET') {
                // Load jQuery
                var inlineHtml = '<script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>';
                // Load Tooltip
                inlineHtml += '<script src="https://unpkg.com/@popperjs/core@2"></script>';
 
                // Load Bootstrap
                inlineHtml += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
                inlineHtml += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';
                // Load DataTables
                inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';
 
                // Load Bootstrap-Select
                inlineHtml += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css">';
                inlineHtml += '<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>';
 
                // Load Netsuite stylesheet and script
                inlineHtml += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
                inlineHtml += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
                inlineHtml += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
                inlineHtml += '<style>.mandatory{color:red;}</style>';
                
                var form = ui.createForm({
                    title: 'MPEX Product Orders (ALL ZEEs)'
                });
                inlineHtml += '<br></br>';
                inlineHtml += progressBar();
                // Open Invoices Datatable
                inlineHtml += '<div class="form-group mpex_orders mpex_orders_table">';
                inlineHtml += '<div class="row">';
                inlineHtml += '<div class="col-xs-12" id="mpex_orders_dt_div">';
                
                // It is inserted as inline html in the script mp_cl_open_ticket
                inlineHtml += '</div></div></div>';

                if (!isNullorEmpty(context.request.parameters.process)) {
                    resetZeeOrders();
                }

                form.addButton({
                    id : 'download_csv',
                    label : 'Export as CSV',
                    functionName : 'downloadCsv()'
                });
                form.addButton({
                    id : 'process_order',
                    label : 'PROCESS ORDERS',
                    functionName : 'resetZeeOrders()'
                });
                
                form.addSubmitButton({
                    label: 'Import Connote Numbers'
                });
                
                form.addField({
                    id: 'custpage_table_csv',
                    type: ui.FieldType.TEXT,
                    label: 'Table CSV'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });

                form.addField({
                    id: 'upload_mpex_csv',
                    label: 'IMPORT CONNOTE NUMBERS',
                    type: ui.FieldType.FILE
                }); 

                form.addField({
                    id: 'preview_table',
                    type: ui.FieldType.INLINEHTML,
                    label: 'preview_table'
                }).updateLayoutType({
                    layoutType: ui.FieldLayoutType.OUTSIDEBELOW
                }).updateBreakType({
                    breakType: ui.FieldBreakType.STARTROW
                }).defaultValue = inlineHtml;
                
                form.clientScriptFileId = 4512553; //SB cl_id =4243619, PROD cl_id = 4512553
                context.response.writePage(form);

            } else {
                var fileObj = context.request.files.upload_mpex_csv;
                  
                if (!isNullorEmpty(fileObj)) {
                    fileObj.folder = 2696109; // Prod=2696109
                    var file_type = fileObj.fileType;
                    if (file_type == 'CSV') {
                        file_type == 'csv';
    
    
                        var file_name = 'mpex_upload' + '.' + file_type;
                    } 
                    fileObj.name = file_name;
    
                    if (file_type == 'CSV') {
                        // Create file and upload it to the file cabinet.
                        var f_id = fileObj.save();
                    } else {
                        throw error.create({
                            message: 'Must be in CSV format',
                            name: 'CSV_ERROR',
                            notifyOff: true
                        });
                    }
                }
                
                // CALL SCHEDULED SCRIPT
                var scriptTask = task.create({ taskType: task.TaskType.SCHEDULED_SCRIPT });
                scriptTask.scriptId = 'customscript_ss_import_connote';
                scriptTask.deploymentId = 'customdeploy_ss_import_connote';
                scriptTask.params = {
                    custscript_import_connote_file_id: f_id,
                    custscript_import_connote_index: 0
                };
                var ss_id = scriptTask.submit();
                
                // Load jQuery
                var inlineHtml = '<script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>';
                // Load Tooltip
                inlineHtml += '<script src="https://unpkg.com/@popperjs/core@2"></script>';
 
                // Load Bootstrap
                inlineHtml += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
                inlineHtml += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';
                // Load DataTables
                inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';
 
                // Load Bootstrap-Select
                inlineHtml += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css">';
                inlineHtml += '<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>';
 
                // Load Netsuite stylesheet and script
                inlineHtml += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
                inlineHtml += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
                inlineHtml += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
                inlineHtml += '<style>.mandatory{color:red;}</style>';
                
                var form = ui.createForm({
                    title: 'MPEX Product Orders (ALL ZEEs)'
                });
                inlineHtml += '<br></br>';
                inlineHtml += progressBar();
                // Open Invoices Datatable
                inlineHtml += '<div class="form-group mpex_orders mpex_orders_table">';
                inlineHtml += '<div class="row">';
                inlineHtml += '<div class="col-xs-12" id="mpex_orders_dt_div">';
                
                // It is inserted as inline html in the script mp_cl_open_ticket
                inlineHtml += '</div></div></div>';

                if (!isNullorEmpty(context.request.parameters.process)) {
                    resetZeeOrders();
                }

                form.addButton({
                    id : 'download_csv',
                    label : 'Export as CSV',
                    functionName : 'downloadCsv()'
                });
                form.addButton({
                    id : 'process_order',
                    label : 'PROCESS ORDERS',
                    functionName : 'resetZeeOrders()'
                });
                
                form.addSubmitButton({
                    label: 'Import Connote Numbers'
                });
                
                form.addField({
                    id: 'custpage_table_csv',
                    type: ui.FieldType.TEXT,
                    label: 'Table CSV'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });

                form.addField({
                    id: 'upload_mpex_csv',
                    label: 'IMPORT CONNOTE NUMBERS',
                    type: ui.FieldType.FILE
                }); 

                form.addField({
                    id: 'preview_table',
                    type: ui.FieldType.INLINEHTML,
                    label: 'preview_table'
                }).updateLayoutType({
                    layoutType: ui.FieldLayoutType.OUTSIDEBELOW
                }).updateBreakType({
                    breakType: ui.FieldBreakType.STARTROW
                }).defaultValue = inlineHtml;
                
                form.clientScriptFileId = 4512553; //SB cl_id =4243619, PROD cl_id = 4512553
                context.response.writePage(form);
                
            }
            

        }
        /**
         * Display the progress bar. Initialized at 0, with the maximum value as the number of records that will be moved.
         * Uses Bootstrap : https://www.w3schools.com/bootstrap/bootstrap_progressbars.asp
         * @param   {String}    nb_records_total    The number of records that will be moved
         * @return  {String}    inlineQty : The inline HTML string of the progress bar.
         */
        function progressBar() {
            var inlineQty = '<div class="progress container hide">';
            inlineQty += '<div class="progress-bar progress-bar-striped progress-bar-warning" id="progress-records" role="progressbar" aria-valuenow="0" style="width:0%">0%</div>';
            inlineQty += '</div>';
            
            return inlineQty;
        }

        function resetZeeOrders() {
            log.debug({
                title: 'in fn',
                details: 'in fn'
            });
            var params = {
                custscript_process_orders: JSON.stringify([])
            };
            var reschedule = task.create({
                taskType: task.TaskType.SCHEDULED_SCRIPT,
                scriptId: 'customscript_ss_product_ordering',
                deploymentId: 'customdeploy_ss_product_ordering',
                params: params
            });
            
            reschedule.submit();
            
            
            // log.debug({
            //     title: 'Scheduled script scheduled',
            //     details: task.checkStatus({ taskId: status})
            // });

            // alert('All Current Franchise orders have been cleared');
            // var urlVar = "https://1048144-sb3.app.netsuite.com" + "/app/site/hosting/scriptlet.nl?script=1094&deploy=1";
            // //console.log(urlVar);
            // //window.location.href = urlVar;
        }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }
        return {
            onRequest: onRequest,
        };
    }
);