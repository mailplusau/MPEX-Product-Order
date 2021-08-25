/**
 
 *@NApiVersion 2.0
 *@NScriptType Suitelet

 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format'], 
    function(ui, email, runtime, search, record, http, log, redirect, format) {
        var role = runtime.getCurrentUser().role;

        function onRequest(context) {  
            
            if (context.request.method === 'GET') {
                var form = ui.createForm({
                    title: 'MPEX Past Orders'
                });

                // Load jQuery
                var inlineHtml2 = '<script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>';
                // Load Tooltip
                inlineHtml2 += '<script src="https://unpkg.com/@popperjs/core@2"></script>';

                // Load Bootstrap
                inlineHtml2 += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
                inlineHtml2 += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';
                // Load DataTables
                inlineHtml2 += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
                inlineHtml2 += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';

                // Load Bootstrap-Select
                inlineHtml2 += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css">';
                inlineHtml2 += '<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>';

                // Load Netsuite stylesheet and script
                inlineHtml2 += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
                inlineHtml2 += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
                inlineHtml2 += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
                inlineHtml2 += '<style>.mandatory{color:red;}</style>'; 
                
                
                if (!isNullorEmpty(context.request.parameters.zee) && context.request.parameters.zee != 0) {
                    log.debug({
                        title: 'testing',
                        details: 'testing'
                    })
                    form.addField({
                        id: 'custpage_zee_selected',
                        type: ui.FieldType.TEXT,
                        label: 'zee'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    }).defaultValue = context.request.parameters.zee;
                } else {
                    form.addField({
                        id: 'custpage_zee_selected',
                        type: ui.FieldType.TEXT,
                        label: 'zee'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });
                }

                if (role != 1000) {
                    inlineHtml2 += franchiseeDropdownSection(context.request.parameters.zee);
                }
                inlineHtml2 += dataTable();
                // The HTML code for the table is inserted with JQuery in the pageInit function of the mp_cl_product_ordering_page script.
                // var zee_id;
                // if (role != 1000) {
                //     zee_id = context.request.parameters.custpage_zee_selected;
                //     log.debug({
                //         title: 'zee',
                //         details: zee_id
                //     });
                // } else {
                //     zee_id = runtime.getCurrentUser().id;
                // }

                


                form.addField({
                    id: 'preview_table',
                    type: ui.FieldType.INLINEHTML,
                    label: 'preview_table'
                }).updateBreakType({
                    breakType: ui.FieldBreakType.STARTROW
                }).defaultValue = inlineHtml2;
                
                form.addButton({
                    id : 'new_order',
                    label : 'CREATE MPEX ORDER',
                    functionName : 'onclick_new_order()'
                });
                form.clientScriptFileId = 4692098; //SB cl_id =, PROD cl_id = 4692098
                context.response.writePage(form); 
                

            } else {
                
            }
            

        }

        function instructionsBox() {
            var inlineQty = '<br></br>';
            //Important Instructions box
            inlineQty += '<div></div>';
            inlineQty += '<div class="form-group container test_section">';
            inlineQty += '<div style=\"background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 20px 30px 30px 30px\"><b><u>Important Instructions:</u></b>';
            inlineQty += '<ul><li><b><u>MPEX Products</u></b>: 1 MPEX product is equivalent to a pack of 10. Please enter the number of 10 packs you require for each item. The minimum number you can order is 10</li>';
            inlineQty += '<li><b><u>Submission</u></b>: Press the "Save Order" button at the top of the screen to submit your order and continue to the confirmation page.</li>';
            inlineQty += '<li>You may only enter numbers into the relevant fields. Entering text will result in an input error and you will be asked to fill out the field again</li>';
            inlineQty += '<li>You will have the option to use the up and down arrows on the far right hand side of the field to set the number of products you require</li>';
            inlineQty += '<li>You are not required to fill out every box if you don\'t require every product.</li>';
            inlineQty += '</ul></div></div><br/>';

            return inlineQty;
        }
        /**
         * The Franchisee dropdown list.
         * @param   {Number}    zee_id
         * @return  {String}    `inlineQty`
         */
        function franchiseeDropdownSection(params_zee) {
            
            var inlineQty = '<br><br><div class="form-group zee_dropdown_section >';

            inlineQty += '<div class="row">';
            // Franchisee dropdown field
            inlineQty += '<div class="col-xs-18 zee_dropdown_div">';
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
                if (!isNullorEmpty(params_zee)) {
                    selected_option = (params_zee == opt_zee_id) ? 'selected' : '';
                }
                
                inlineQty += '<option value="' + opt_zee_id + '" ' + selected_option + '>' + opt_zee_name + '</option>';
                return true;
            });

            inlineQty += '</select>';
            inlineQty += '</div></div></div></div><br></br>';

            return inlineQty;
        }
        

        /**
         * The table that will display the differents invoices linked to the franchisee and the time period.
         * @return  {String}    inlineQty
         */
        function dataTable() {
            var inlineQty = '<br></br><style>table#mpex_orders {font-size: 12px;text-align: center;border: none;}.dataTables_wrapper {font-size: 14px;}table#mpex_orders th{text-align: center;} .bolded{font-weight: bold;}</style>';
            inlineQty += '<table id="mpex_orders" class="table table-responsive table-striped customer tablesorter" style="width: 100%;">';
            inlineQty += '<thead style="color: white;background-color: #379E8F;">';
            inlineQty += '<tr class="text-center">';
            inlineQty += '</tr>';
            inlineQty += '</thead>';

            inlineQty += '<tbody id="result_import" class="result-import"></tbody>';

            inlineQty += '</table>';
            return inlineQty;
        }

        function formatDate(testDate){
            //console.log('testDate: '+testDate);
            var responseDate=format.format({value:testDate,type:format.Type.DATE});
            //console.log('responseDate: '+responseDate);
            return responseDate;
        }

      
        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }
        return {
            onRequest: onRequest
        };
    }
);