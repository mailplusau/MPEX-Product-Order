/**
 * 
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * 
 * Description: Import an excel file of connote numbers to add into processed orders
 * @Last Modified by: Sruti Desai
 * 
 */


define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/log', 'N/redirect', 'N/format', 'N/task', 'N/file'], 
function(ui, email, runtime, search, record, log, redirect, format, task, file) {
    var baseURL = 'https://1048144.app.netsuite.com';
    if (runtime.EnvType == "SANDBOX") {
        baseURL = 'https://1048144-sb3.app.netsuite.com';
    }
    var zee = 0;
    var role = runtime.getCurrentUser().role;
    if (role == 1000) {
        //Franchisee
        zee = runtime.getCurrentUser().id;
    } 

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
                title: 'MPEX Import Connote'
            });
            inlineHtml += '<br></br>';
            inlineHtml += dateFilterSection();

            form.addSubmitButton({
                label: 'Import Connote Numbers'
            });
            
            
            form.addField({
                id: 'upload_mpex_csv',
                label: 'IMPORT CONNOTE NUMBERS',
                type: ui.FieldType.FILE
            }); 
        
            form.addField({
                id: 'custpage_date_from',
                type: ui.FieldType.DATE,
                label: 'date_from'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue;

            form.addField({
                id: 'custpage_date_to',
                type: ui.FieldType.DATE,
                label: 'date_to'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue;

            form.addField({
                id: 'custpage_test',
                type: ui.FieldType.TEXT,
                label: 'date_to'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue;

            form.addField({
                id: 'custpage_scheduled',
                type: ui.FieldType.TEXT,
                label: 'scheduled'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
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
            
            // form.addField({
            //     id: 'preview_table',
            //     type: ui.FieldType.INLINEHTML,
            //     label: 'preview_table'
            // }).updateLayoutType({
            //     layoutType: ui.FieldLayoutType.OUTSIDEBELOW
            // }).updateBreakType({
            //     breakType: ui.FieldBreakType.STARTROW
            // }).defaultValue = inlineHtml;

            form.clientScriptFileId = 4686408; //SB cl_id =, PROD cl_id = 4686408
            context.response.writePage(form);

        } else {
            var fileObj = context.request.files.upload_mpex_csv;
            var date_from = context.request.parameters.custpage_date_from;
            var date_to = context.request.parameters.custpage_date_to;

            if (!isNullorEmpty(date_from) && !isNullorEmpty(date_to)) {
                date_from = formatDate(date_from);
                date_to = formatDate(date_to);
            }
            

            log.debug({
                title: 'date_from',
                details: date_from
            });

            log.debug({
                title: 'date_to',
                details: date_to
            });


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
                custscript_import_connote_index: 0,
                custscript_import_connote_date_from: date_from,
                custscript_import_connote_date_to: date_to
            };
            var ss_id = scriptTask.submit();
            
            var file1 = file.load({
                id: f_id
            });

            var iterator = file1.lines.iterator();

            // skip first line (header)
            iterator.each(function (line) { 
                log.debug({ title: 'line', details: line });
                return false;
            });

            var numLines = 0;
            var zeeArr = [];
            iterator.each(function (line) {
                var csv_values = line.value.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                var zee_id = csv_values[1];
                if (zeeArr.indexOf(zee_id) == -1) {
                    zeeArr.push(zee_id);
                }
                numLines++;
                return true;
            });

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
            inlineHtml += dateFilterSection();

            // Open Invoices Datatable
            inlineHtml += '<div class="form-group mpex_orders mpex_orders_table">';
            inlineHtml += '<div class="row">';
            inlineHtml += '<div class="col-xs-12" id="mpex_orders_dt_div">';
            
            // It is inserted as inline html in the script mp_cl_open_ticket
            inlineHtml += '</div></div></div>';

            form.addSubmitButton({
                label: 'Import Connote Numbers'
            });

            form.addField({
                id: 'upload_mpex_csv',
                label: 'IMPORT CONNOTE NUMBERS',
                type: ui.FieldType.FILE
            }); 

            form.addField({
                id: 'custpage_date_from',
                type: ui.FieldType.DATE,
                label: 'date_from'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = date_from;

            form.addField({
                id: 'custpage_scheduled',
                type: ui.FieldType.TEXT,
                label: 'scheduled'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = 2;

            form.addField({
                id: 'zee_array',
                type: ui.FieldType.TEXT,
                label: 'zee_array'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = zeeArr;


            form.addField({
                id: 'excel_lines',
                type: ui.FieldType.TEXT,
                label: 'excel_lines'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = numLines;

            form.addField({
                id: 'custpage_date_to',
                type: ui.FieldType.DATE,
                label: 'date_to'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = date_to;

            form.addField({
                id: 'preview_table',
                type: ui.FieldType.INLINEHTML,
                label: 'preview_table'
            }).updateLayoutType({
                layoutType: ui.FieldLayoutType.OUTSIDEBELOW
            }).updateBreakType({
                breakType: ui.FieldBreakType.STARTROW
            }).defaultValue = inlineHtml;
            
            form.clientScriptFileId = 4686408; //SB cl_id =, PROD cl_id = 4686408
            context.response.writePage(form);
            
        }
    }

    /**
     * The date input fields to filter the invoices.
     * Even if the parameters `date_from` and `date_to` are defined, they can't be initiated in the HTML code.
     * They are initiated with jQuery in the `pageInit()` function.
     * @return  {String} `inlineQty`
     */
    function dateFilterSection() {
        var inlineQty = '<div class="form-group container total_amount_section">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-18 heading1"><h4><span class="label label-default col-xs-12">DATE FILTER</span></h4></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group date_filter_section">';
        inlineQty += '<div class="row">';
        // Date from field
        inlineQty += '<div class="col-xs-6 date_from">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="date_from_text">From</span>';
        inlineQty += '<input id="date_from" class="form-control date_from" type="date"/>';
        inlineQty += '</div></div>';
        // Date to field
        inlineQty += '<div class="col-xs-6 date_to">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="date_to_text">To</span>';
        inlineQty += '<input id="date_to" class="form-control date_to" type="date">';
        inlineQty += '</div></div></div></div>';

        return inlineQty;
    }

    /**
     * Display the progress bar. Initialized at 0, with the maximum value as the number of records that will be moved.
     * Uses Bootstrap : https://www.w3schools.com/bootstrap/bootstrap_progressbars.asp
     * @param   {String}    nb_records_total    The number of records that will be moved
     * @return  {String}    inlineQty : The inline HTML string of the progress bar.
     */
    function progressBar() {
        var inlineQty = '<div class="progress ">';
        inlineQty += '<div class="progress-bar progress-bar-striped progress-bar-warning" id="progress-records" role="progressbar" aria-valuenow="0" style="width:0%">0%</div>';
        inlineQty += '</div>';
        
        return inlineQty;
    }

    function formatDate(testDate){
        var responseDate=format.format({value:testDate,type:format.Type.DATE});
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
        onRequest: onRequest
    };

});