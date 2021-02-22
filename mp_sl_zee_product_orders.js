/**
 
 *@NApiVersion 2.0
 *@NScriptType Suitelet

 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format', 'N/task'], 
function(ui, email, runtime, search, record, http, log, redirect, format, task) {
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
                inlineHtml += franchiseeDropdownSection();
                inlineHtml += dateFilterSection();
                inlineHtml += '<br></br>';

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
                    label : 'Process Orders',
                    functionName : 'resetZeeOrders()'
                });
                
                form.addButton({
                    id : 'submit_date',
                    label : 'Add Filters',
                    functionName : 'submitDate()'
                });
                
                form.addButton({
                    id : 'import_connote',
                    label : 'Import Connote Numbers',
                    functionName : 'importConnote()'
                });

                form.addField({
                    id: 'custpage_table_csv',
                    type: ui.FieldType.TEXT,
                    label: 'Table CSV'
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
                
                form.clientScriptFileId = 4512553; //SB cl_id =4243619, PROD cl_id = 4512553
                context.response.writePage(form);

            } else {                
               
                
            }
            

        }
        /**
         * Display the progress bar. Initialized at 0, with the maximum value as the number of records that will be moved.
         * Uses Bootstrap : https://www.w3schools.com/bootstrap/bootstrap_progressbars.asp
         * @param   {String}    nb_records_total    The number of records that will be moved
         * @return  {String}    inlineQty : The inline HTML string of the progress bar.
         */
        function progressBar() {
            var inlineQty = '<div class="form-group container break_section hide">';
            inlineQty += '</div>';
            inlineQty += '<div class="progress hide">';
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
        
        }


        /**
         * The date input fields to filter the invoices.
         * Even if the parameters `date_from` and `date_to` are defined, they can't be initiated in the HTML code.
         * They are initiated with jQuery in the `pageInit()` function.
         * @return  {String} `inlineQty`
         */
        function dateFilterSection() {
            var inlineQty = '<div class="form-group container total_amount_section hide">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12">DATE FILTER</span></h4></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            inlineQty += '<div class="form-group container date_filter_section">';
            inlineQty += '<div class="row">';
            // Date from field
            inlineQty += '<div class="col-xs-6 date_from hide">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="date_from_text">From</span>';
            inlineQty += '<input id="date_from" class="form-control date_from" type="date"/>';
            inlineQty += '</div></div>';
            // Date to field
            inlineQty += '<div class="col-xs-6 date_to hide">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="date_to_text">To</span>';
            inlineQty += '<input id="date_to" class="form-control date_to" type="date">';
            inlineQty += '</div></div></div></div>';

            return inlineQty;
        }

                /**
         * The Franchisee dropdown list.
         * @param   {Number}    zee_id
         * @return  {String}    `inlineQty`
         */
        function franchiseeDropdownSection() {

            var inlineQty = '<div class="form-group container header_section hide">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12">FRANCHISEE FILTER</span></h4></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';
            inlineQty += '<div class="form-group container zee_dropdown_section >';

            inlineQty += '<div class="row">';
            // Franchisee dropdown field
            inlineQty += '<div class="col-xs-18 zee_dropdown_div hide">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" id="zee_dropdown_text">FRANCHISEE</span>';
            inlineQty += '<select id="zee_dropdown" class="form-control zee_dropdown" required>';
            inlineQty += '<option></option>';

            // Load the franchisees options
            var zeesSearch = search.load({
                id: 'customsearch_job_inv_process_zee',
                type: search.Type.PARTNER
            });

            var zeesSearchResults = zeesSearch.run();
            zeesSearchResults.each(function (zeesSearchResult) {
                var opt_zee_id = zeesSearchResult.getValue('internalid');
                    var opt_zee_name = zeesSearchResult.getValue('companyname');
                    
                var selected_option = '';
                if (role == 1000) {
                    zee_id = runtime.getCurrentUser().id; //Get Franchisee ID-- REMOVE TO TEST
                    selected_option = (opt_zee_id == zee_id) ? 'selected' : '';
                }
                
                
                inlineQty += '<option value="' + opt_zee_id + '" ' + selected_option + '>' + opt_zee_name + '</option>';
                return true;
            });

            inlineQty += '</select>';
            inlineQty += '</div></div></div></div>';

            return inlineQty;
        }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }
        return {
            onRequest: onRequest,
        };
    }
);