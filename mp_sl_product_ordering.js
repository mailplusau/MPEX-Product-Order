/**
 
 *@NApiVersion 2.0
 *@NScriptType Suitelet

 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format'], 
    function(ui, email, runtime, search, record, http, log, redirect, format) {
        var role = runtime.getCurrentUser().role;

        function onRequest(context) {  
            var b4 = '';
            var g500 = '';
            var kg1 = '';
            var kg3 = '';
            var kg5 = '';
            var test = false;
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
                    title: 'MPEX Product Ordering'
                });

                if (!isNullorEmpty(context.request.parameters.zee) || role == 1000) {
                    var zee;
                    if (role == 1000) {
                        zee = runtime.getCurrentUser().id;
                    } else {
                        zee = context.request.parameters.zee;
                    }
                     
                    var zeeSearch = search.load({
                        id: 'customsearch_mpex_zee_order_search',
                        type: 'customrecord_zee_mpex_order'
                    });
                    
                    zeeSearch.filters.push(search.createFilter({
                        name: 'custrecord_mpex_order_franchisee',
                        operator: search.Operator.IS,
                        values: zee
                    }));
        
                    var zeeResultSet = zeeSearch.run();
                    var activeOrder = 0;
                    var b4 = ''; var g500 = ''; var kg1 = ''; var kg3 = ''; var kg5 = ''; 
                    zeeResultSet.each(function(searchResult) {
                        var connote = searchResult.getValue({ name: 'custrecord_mpex_order_connote'});
                        var status = searchResult.getValue({ name: 'custrecord_mpex_order_status'});
                        
                        if (status == 1 && isNullorEmpty(connote)) {
                            activeOrder = searchResult.getValue({ name: 'id'});
                            b4 = searchResult.getValue({name: "custrecord_mpex_order_b4" });
                            g500 = searchResult.getValue({name: "custrecord_mpex_order_500_satchel" });
                            kg1 = searchResult.getValue({name: "custrecord_mpex_order_1kg_satchel" });
                            kg3 = searchResult.getValue({name: "custrecord_mpex_order_3kg_satchel" });
                            kg5 = searchResult.getValue({name: "custrecord_mpex_order_5kg_satchel" });
                            test = true;
                            return false;
                        }
                        return true;
                    });
        
                }

                //Instructions
                inlineHtml += instructionsBox();

                //Heading
                inlineHtml += '<div class="form-group container product_order_section">';
                inlineHtml += '<div class="row">';
                inlineHtml += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12">MPEX PRODUCT ORDER</span></h4></div>';
                inlineHtml += '</div>';
                inlineHtml += '</div>';

                if (role != 1000) {
                    inlineHtml += franchiseeDropdownSection(context.request.parameters.zee);
                }

                inlineHtml += inputFields(b4, g500, kg1, kg3, kg5, test);


                if (!isNullorEmpty(context.request.parameters.zee) && context.request.parameters.zee != 0) {
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
                form.addField({
                    id: 'preview_table',
                    type: ui.FieldType.INLINEHTML,
                    label: 'preview_table'
                }).updateBreakType({
                    breakType: ui.FieldBreakType.STARTROW
                }).defaultValue = inlineHtml;

                form.addField({
                    id: 'results',
                    type: ui.FieldType.TEXT,
                    label: 'results'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });

                form.addField({
                    id: 'custpage_b4',
                    type: ui.FieldType.TEXT,
                    label: 'b4'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });

                form.addField({
                    id: 'custpage_g500',
                    type: ui.FieldType.TEXT,
                    label: 'g500'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });

                form.addField({
                    id: 'custpage_kg1',
                    type: ui.FieldType.TEXT,
                    label: 'kg1'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });

                form.addField({
                    id: 'custpage_kg3',
                    type: ui.FieldType.TEXT,
                    label: 'kg3'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });

                form.addField({
                    id: 'custpage_kg5',
                    type: ui.FieldType.TEXT,
                    label: 'kg5'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });

                form.addSubmitButton({
                    label : 'SUBMIT ORDER'
                });

                form.clientScriptFileId = 4509791; //SB cl_id =4242817, PROD cl_id = 4509791

                context.response.writePage(form);

            } else {
                var zee_id = context.request.parameters.custpage_zee_selected;
                var b4 = context.request.parameters.custpage_b4;
                var g500 = context.request.parameters.custpage_g500;
                var kg1 = context.request.parameters.custpage_kg1;
                var kg3 = context.request.parameters.custpage_kg3;
                var kg5 = context.request.parameters.custpage_kg5;

                createCustomRecord(zee_id, b4, g500, kg1, kg3, kg5);
                var form = ui.createForm({
                    title: 'MPEX Product Order Confirmation'
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
                
                inlineHtml2 += dataTable();
                // The HTML code for the table is inserted with JQuery in the pageInit function of the mp_cl_product_ordering_page script.
                var zee_id = '';
                if (role != 1000) {
                    zee_id = context.request.parameters.custpage_zee_selected;
                    log.debug({
                        title: 'zee',
                        details: zee_id
                    });
                } else {
                    zee_id = runtime.getCurrentUser().id;
                }

                form.addField({
                    id: 'custpage_zee_selected',
                    type: ui.FieldType.TEXT,
                    label: 'zee'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = zee_id;

                form.addField({
                    id: 'results',
                    type: ui.FieldType.TEXT,
                    label: 'results'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = true;

                form.addField({
                    id: 'preview_table',
                    type: ui.FieldType.INLINEHTML,
                    label: 'preview_table'
                }).updateBreakType({
                    breakType: ui.FieldBreakType.STARTROW
                }).defaultValue = inlineHtml2;
                
                form.addButton({
                    id : 'submit',
                    label : 'CHANGE ORDER',
                    functionName : 'onclick_submit()'
                });
                form.clientScriptFileId = 4509791; //SB cl_id =4242817, PROD cl_id = 4509791
                context.response.writePage(form); 
                
            }
            

        }

        function createCustomRecord(zee_id, b4, g500, kg1, kg3, kg5) {
            var activeOrder = checkConnote(zee_id);
            //Load active order if it exists
            if (activeOrder != 0) {
                var mpexOrderRec = record.load({
                    type: 'customrecord_zee_mpex_order',
                    id: activeOrder
                });
                //var date = new Date();
                date.setDate(date.getDate() + 1);
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_b4', value: b4});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_500_satchel', value: g500});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_1kg_satchel', value: kg1});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_3kg_satchel', value: kg3});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_5kg_satchel', value: kg5});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_total', value: b4 + g500 + kg1 + kg3 + kg5});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_date', value: date});

                mpexOrderRec.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
            } else {
                var zeeSearch = search.load({
                    id: 'customsearch_zee_mpex_product_order',
                    type: search.Type.PARTNER
                });
                
                zeeSearch.filters.push(search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.IS,
                    values: zee_id
                }));

                var zeeResultSet = zeeSearch.run();
                
                var tollAcctNum; var dxAddr; var dxExch; var state; var zip;
                zeeResultSet.each(function(searchResult) {
                    tollAcctNum = searchResult.getValue('custentity_toll_acc_number');
                    dxAddr = searchResult.getValue({
                        name: "custrecord_ap_lodgement_addr2",
                        join: "CUSTENTITY__TOLL_PICKUP_DX_NO",
                        label: "Address 2"
                        });
                    
                    dxExch = searchResult.getValue({
                        name: "custrecord_ap_lodgement_suburb",
                        join: "CUSTENTITY__TOLL_PICKUP_DX_NO",
                        label: "Suburb"
                    });

                    state = searchResult.getText({
                        name: "custrecord_ap_lodgement_site_state",
                        join: "CUSTENTITY__TOLL_PICKUP_DX_NO",
                        label: "State"
                    });
                    zip = searchResult.getValue({
                        name: "custrecord_ap_lodgement_postcode",
                        join: "CUSTENTITY__TOLL_PICKUP_DX_NO",
                        label: "Post Code"
                    });

                });

                var mpexOrderRec = record.create({
                    type: 'customrecord_zee_mpex_order',
                    isDynamic: true,
                });
                
                var date = new Date();
                //date.setDate(date.getDate() + 1);
                //1 = ACTIVE, 2 = PROCESSING, 3 = COMPLETED (if connote)
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_status', value: 1});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_franchisee', value: zee_id});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_b4', value: b4});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_500_satchel', value: g500});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_1kg_satchel', value: kg1});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_3kg_satchel', value: kg3});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_5kg_satchel', value: kg5});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_total', value: b4 + g500 + kg1 + kg3 + kg5});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_date', value: date });
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_mp_id', value: zee_id});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_toll_acc_num', value: tollAcctNum});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_dx_addr', value: dxAddr});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_dx_exch', value: dxExch});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_state', value: state});
                mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_postcode', value: zip});

                mpexOrderRec.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
            }
        }
        function checkConnote(zee) {
            var zeeSearch = search.load({
                id: 'customsearch_mpex_zee_order_search',
                type: 'customrecord_zee_mpex_order'
            });
            
            zeeSearch.filters.push(search.createFilter({
                name: 'custrecord_mpex_order_franchisee',
                operator: search.Operator.IS,
                values: zee
            }));

            var zeeResultSet = zeeSearch.run();
            var activeOrder = 0;
            zeeResultSet.each(function(searchResult) {
                var connote = searchResult.getValue({ name: 'custrecord_mpex_order_connote'});
                var status = searchResult.getValue({ name: 'custrecord_mpex_order_status'});
                if (status == 1 && isNullorEmpty(connote)) {
                    log.debug({
                        title: 'INSIDE CONNOTEEE',
                        details: 'INSIDE CONNOTEEE'
                    });
                    activeOrder = searchResult.getValue({ name: 'id'});
                    return false;
                }
                return true;
            });

            return activeOrder;
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
        
        function inputFields(b4, g500, kg1, kg3, kg5, test) {
            //Add Break
            //var inlineQty = '<div class="form-group container break_section"><div class="row"></div></div>'
                          
            //500g AND 5KG Options
            var inlineQty = '<div class="form-group container g500_section">';
            inlineQty += '<div class="row">';
            if (test) {
                inlineQty += '<div class="col-xs-6 g500_env"><div class="input-group"><span class="input-group-addon" id="500g">500G SATCHEL (PACKS OF 10)  </span><input id="500g_text" type="number" min="0" step="10" class="form-control 500g"   value="' + g500 + '"/></div></div>';
                inlineQty += '<div class="col-xs-6 kg5_env"><div class="input-group"><span class="input-group-addon" id="5kg">5KG SATCHEL (PACKS OF 10)  </span><input id="5kg_text" type="number" min="0" step="10" class="form-control 5kg"   value="' + kg5 + '"/></div></div>';

            } else {
                inlineQty += '<div class="col-xs-6 g500_env"><div class="input-group"><span class="input-group-addon" id="500g">500G SATCHEL (PACKS OF 10)  </span><input id="500g_text" type="number" min="0" step="10" class="form-control 500g"   placeholder="Enter quantity" value="' + g500 + '"/></div></div>';
                inlineQty += '<div class="col-xs-6 kg5_env"><div class="input-group"><span class="input-group-addon" id="5kg">5KG SATCHEL (PACKS OF 10)  </span><input id="5kg_text" type="number" min="0" step="10" class="form-control 5kg"   placeholder="Enter quantity" value="' + kg5 + '"/></div></div>';

            }
            inlineQty += '</div>';
            inlineQty += '</div>';

            //1KG and B4 options
            inlineQty += '<div class="form-group container b4_section">';
            inlineQty += '<div class="row">';
            if (test) {
                inlineQty += '<div class="col-xs-6 kg1_env"><div class="input-group"><span class="input-group-addon" id="1kg">1KG SATCHEL (PACKS OF 10)    </span><input id="1kg_text" type="number" min="0" step="10" class="form-control 1kg"  value="' + kg1 + '"/></div></div>';
                inlineQty += '<div class="col-xs-6 b4_env"><div class="input-group"><span class="input-group-addon" id="b4">B4 ENVELOPE (PACKS OF 10)    </span><input id="b4_text" type="number" min="0" step="10" class="form-control b4"   value="' + b4 + '"/></div></div>';

            } else {
                inlineQty += '<div class="col-xs-6 kg1_env"><div class="input-group"><span class="input-group-addon" id="1kg">1KG SATCHEL (PACKS OF 10)    </span><input id="1kg_text" type="number" min="0" step="10" class="form-control 1kg"  placeholder="Enter quantity"value="' + kg1 + '"/></div></div>';    
                inlineQty += '<div class="col-xs-6 b4_env"><div class="input-group"><span class="input-group-addon" id="b4">B4 ENVELOPE (PACKS OF 10)   </span><input id="b4_text" type="number" min="0" step="10" class="form-control b4"   placeholder="Enter quantity" value="' + b4 + '"/></div></div>';

            }
            inlineQty += '</div>';
            inlineQty += '</div>';

            //3KG options
            inlineQty += '<div class="form-group container c5_section">';
            inlineQty += '<div class="row">';
            if (test) {
                inlineQty += '<div class="col-xs-6 kg3_env"><div class="input-group"><span class="input-group-addon" id="3kg">3KG SATCHEL (PACKS OF 10)</span><input id="3kg_text" type="number" min="0" step="10" class="form-control 3kg"   value="' + kg3 + '"/></div></div>';
                
            } else {
                inlineQty += '<div class="col-xs-6 kg3_env"><div class="input-group"><span class="input-group-addon" id="3kg">3KG SATCHEL (PACKS OF 10)</span><input id="3kg_text" type="number" min="0" step="10" class="form-control 3kg"   placeholder="Enter quantity" value="' + kg3 + '"/></div></div>';
                
            }
            inlineQty += '</div>';
            inlineQty += '</div>';
            
            return inlineQty;
        }

        
        /**
         * The table that will display the differents invoices linked to the franchisee and the time period.
         * @return  {String}    inlineQty
         */
        function dataTable() {
            var inlineQty = '<br></br><style>table#mpex_orders {font-size: 12px;text-align: center;border: none;}.dataTables_wrapper {font-size: 14px;}table#mpex_orders th{text-align: center;} .bolded{font-weight: bold;}</style>';
            inlineQty += '<table id="mpex_orders" class="table table-responsive table-striped customer tablesorter" style="width: 100%;">';
            inlineQty += '<thead style="color: white;background-color: #607799;">';
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

        
        

        /**
         * The Franchisee dropdown list.
         * @param   {Number}    zee_id
         * @return  {String}    `inlineQty`
         */
        function franchiseeDropdownSection(params_zee) {
            
            var inlineQty = '<div class="form-group container zee_dropdown_section >';

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
            inlineQty += '</div></div></div></div>';

            return inlineQty;
        }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }
        return {
            onRequest: onRequest
        };
    }
);