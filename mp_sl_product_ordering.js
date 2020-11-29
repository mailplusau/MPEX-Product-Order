/**
 
 *@NApiVersion 2.0
 *@NScriptType Suitelet

 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format'], 
    function(ui, email, runtime, search, record, http, log, redirect, format) {
        var role = runtime.getCurrentUser().role;
        var test = false;
        function onRequest(context) {  
            var b4 = '';
            var c5 = '';
            var dl = ''
            var g500 = '';
            var kg1 = '';
            var kg3 = '';
            var kg5 = '';
            
            if (context.request.method === 'GET') {
                var inlineHtml = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
                //inlineHtml += '<script src="http://code.jquery.com/jquery-1.11.3.min.js"></script>';
                // Load DataTables
                inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';
                inlineHtml += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
                inlineHtml += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';
        
                
                var form = ui.createForm({
                    title: 'MPEX Product Ordering'
                });

                if (test) {
                    //zee_id = 779884;//COMMENT
                    var zee_id = '';
                    if (role != 1000) {
                        zee_id = context.currentRecord.getField({ fieldId: 'custpage_zee_selected' });
                    } else {
                        zee_id = runtime.getCurrentUser().id; //Get Franchisee ID-- REMOVE TO TEST
                    }
                    var zeeRecord = record.load({
                        type: record.Type.PARTNER,
                        id: zee_id,
                        isDynamic: true
                    });

                    b4 = zeeRecord.getValue({
                        fieldId: 'custentity_mpex_b4'
                    });
                    c5 = zeeRecord.getValue({
                        fieldId: 'custentity_mpex_c5',
                    });
                    dl = zeeRecord.getValue({
                        fieldId: 'custentity_mpex_dl',
                    });
                    g500 = zeeRecord.getValue({
                        fieldId: 'custentity_mpex_500g',
                    });
                    kg1 = zeeRecord.getValue({
                        fieldId: 'custentity_mpex_1kg',
                    });
                    kg3 = zeeRecord.getValue({
                        fieldId: 'custentity_mpex_3kg',
                    });
                    kg5 = zeeRecord.getValue({
                        fieldId: 'custentity_mpex_5kg',
                    });
                }
                inlineHtml += '<br></br>';
                //Important Instructions box
                inlineHtml += '<div></div>';
                inlineHtml += '<div class="form-group container test_section">';
                inlineHtml += '<div style=\"background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 20px 30px 30px 30px\"><b><u>Important Instructions:</u></b>';
                inlineHtml += '<ul><li><b><u>MPEX Products</u></b>: 1 MPEX product is equivalent to a pack of 10. Please enter the number of 10 packs you require for each item. </li>';
                inlineHtml += '<li><b><u>Submission</u></b>: Press the "Save Order" button at the top of the screen to submit your order and continue to the confirmation page.</li>';
                inlineHtml += '<li>You may only enter numbers into the relevant fields. Entering text will result in an input error and you will be asked to fill out the field again</li>';
                inlineHtml += '<li>You will have the option to use the up and down arrows on the far right hand side of the field to set the number of products you require</li>';
                inlineHtml += '<li>You are not required to fill out every box if you don\'t require every product.</li>';
                inlineHtml += '</ul></div></div><br/>';

                //Heading
                inlineHtml += '<div class="form-group container product_order_section">';
                inlineHtml += '<div class="row">';
                inlineHtml += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12">MPEX PRODUCT ORDER</span></h4></div>';
                inlineHtml += '</div>';
                inlineHtml += '</div>';

                if (role != 1000) {
                    inlineHtml += franchiseeDropdownSection();
                }
                //B4 and 1KG options
                inlineHtml += '<div class="form-group container b4_section">';
                inlineHtml += '<div class="row">';
                if (test) {
                    inlineHtml += '<div class="col-xs-6 b4_env"><div class="input-group"><span class="input-group-addon" id="b4">B4 ENVELOPE    </span><input id="b4_text" type="number" min="0" step="1" class="form-control b4"   value="' + b4 + '"/></div></div>';
                    inlineHtml += '<div class="col-xs-6 kg1_env"><div class="input-group"><span class="input-group-addon" id="1kg">1KG SATCHEL    </span><input id="1kg_text" type="number" min="0" step="1" class="form-control 1kg"  value="' + kg1 + '"/></div></div>';
                    
                } else {
                    inlineHtml += '<div class="col-xs-6 b4_env"><div class="input-group"><span class="input-group-addon" id="b4">B4 ENVELOPE    </span><input id="b4_text" type="number" min="0" step="1" class="form-control b4"   placeholder="Enter quantity" value="' + b4 + '"/></div></div>';
                    inlineHtml += '<div class="col-xs-6 kg1_env"><div class="input-group"><span class="input-group-addon" id="1kg">1KG SATCHEL    </span><input id="1kg_text" type="number" min="0" step="1" class="form-control 1kg"  placeholder="Enter quantity"value="' + kg1 + '"/></div></div>';    
                }
                inlineHtml += '</div>';
                inlineHtml += '</div>';

                //C5 and 3KG options
                inlineHtml += '<div class="form-group container c5_section">';
                inlineHtml += '<div class="row">';
                if (test) {
                    inlineHtml += '<div class="col-xs-6 c5_env"><div class="input-group"><span class="input-group-addon" id="c5">C5 ENVELOPE</span><input id="c5_text" type="number" min="0" step="1" class="form-control c5"   value="' + c5 + '"/></div></div>';
                    inlineHtml += '<div class="col-xs-6 kg3_env"><div class="input-group"><span class="input-group-addon" id="3kg">3KG SATCHEL</span><input id="3kg_text" type="number" min="0" step="1" class="form-control 3kg"   value="' + kg3 + '"/></div></div>';
                    
                } else {
                    inlineHtml += '<div class="col-xs-6 c5_env"><div class="input-group"><span class="input-group-addon" id="c5">C5 ENVELOPE</span><input id="c5_text" type="number" min="0" step="1" class="form-control c5"   placeholder="Enter quantity" value="' + c5 + '"/></div></div>';
                    inlineHtml += '<div class="col-xs-6 kg3_env"><div class="input-group"><span class="input-group-addon" id="3kg">3KG SATCHEL</span><input id="3kg_text" type="number" min="0" step="1" class="form-control 3kg"   placeholder="Enter quantity" value="' + kg3 + '"/></div></div>';
                    
                }
                inlineHtml += '</div>';
                inlineHtml += '</div>';

                //DL and 5KG options
                inlineHtml += '<div class="form-group container dl_section">';
                inlineHtml += '<div class="row">';
                if (test) {
                    inlineHtml += '<div class="col-xs-6 dl_env"><div class="input-group"><span class="input-group-addon" id="dl">DL ENVELOPE  </span><input id="dl_text" type="number" min="0" step="1" class="form-control dl"   value="' + dl + '"/></div></div>';
                    inlineHtml += '<div class="col-xs-6 kg5_env"><div class="input-group"><span class="input-group-addon" id="5kg">5KG SATCHEL  </span><input id="5kg_text" type="number" min="0" step="1" class="form-control 5kg"   value="' + kg5 + '"/></div></div>';
                    
                } else {
                    inlineHtml += '<div class="col-xs-6 dl_env"><div class="input-group"><span class="input-group-addon" id="dl">DL ENVELOPE  </span><input id="dl_text" type="number" min="0" step="1" class="form-control dl"   placeholder="Enter quantity" value="' + dl + '"/></div></div>';
                    inlineHtml += '<div class="col-xs-6 kg5_env"><div class="input-group"><span class="input-group-addon" id="5kg">5KG SATCHEL  </span><input id="5kg_text" type="number" min="0" step="1" class="form-control 5kg"   placeholder="Enter quantity" value="' + kg5 + '"/></div></div>';
                    
                }
                inlineHtml += '</div>';
                inlineHtml += '</div>';

                //500g Options
                inlineHtml += '<div class="form-group container g500_section">';
                inlineHtml += '<div class="row">';
                if (test) {
                    inlineHtml += '<div class="col-xs-6 g500_env"><div class="input-group"><span class="input-group-addon" id="500g">500G SATCHEL  </span><input id="500g_text" type="number" min="0" step="1" class="form-control 500g"   value="' + g500 + '"/></div></div>';

                } else {
                    inlineHtml += '<div class="col-xs-6 g500_env"><div class="input-group"><span class="input-group-addon" id="500g">500G SATCHEL  </span><input id="500g_text" type="number" min="0" step="1" class="form-control 500g"   placeholder="Enter quantity" value="' + g500 + '"/></div></div>';

                }
                inlineHtml += '</div>';
                inlineHtml += '</div>';

                form.addSubmitButton({
                    label : 'SAVE ORDER'
                });
                
                form.addField({
                    id: 'custpage_zee_selected',
                    type: ui.FieldType.TEXT,
                    label: 'Zee Selected'
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

                
                test = true;
                form.clientScriptFileId = 4509791; //SB cl_id =4242817, PROD cl_id = 4509791

                context.response.writePage(form);



            } else {
                var form = ui.createForm({
                    title: 'MPEX Product Order Confirmation'
                });

                // Load DataTables && js libraries
                var inlineHtml = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
                inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';

                inlineHtml += '<br></br>';

                // // Heading
                inlineHtml += '<div class="form-group container product_order_section">';
                inlineHtml += '<div class="row">';
                inlineHtml += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12">YOUR MPEX PRODUCT ORDER</span></h4></div>';
                inlineHtml += '</div>';
                inlineHtml += '</div>';

                inlineHtml += '<div class="form-group container mpex_order_table" style="font-size: small;">';
                inlineHtml += '<div class="row">';
                inlineHtml += '<div class="col-xs-12 mpex_order_table_div">';
                // The HTML code for the table is inserted with JQuery in the pageInit function of the mp_cl_product_ordering_page script.
                var zee_id = '';
                if (role != 1000) {
                    zee_id = context.request.parameters.custpage_zee_selected;
                    //zee_id = context.currentRecord.getField({ fieldId: 'custpage_zee_selected' });

                } else {
                    zee_id = runtime.getCurrentUser().id;
                }
                inlineHtml += resultsTable(zee_id);
                
                inlineHtml += '</div></div></div>';
                
                form.addField({
                    id: 'preview_table',
                    type: ui.FieldType.INLINEHTML,
                    label: 'preview_table'
                }).updateLayoutType({
                    layoutType: ui.FieldLayoutType.OUTSIDEBELOW
                }).updateBreakType({
                    breakType: ui.FieldBreakType.STARTROW
                }).defaultValue = inlineHtml;
                
                form.addButton({
                    id : 'edit',
                    label : 'EDIT ORDER',
                    functionName : 'onclick_back()'
                });
                form.addButton({
                    id : 'submit',
                    label : 'CONFIRM ORDER',
                    functionName : 'onclick_submit()'
                });
                form.clientScriptFileId = 4509791; //SB cl_id =4242817, PROD cl_id = 4509791
                context.response.writePage(form); 
                
            }
            

        }


        
        function resultsTable(id) {
            var inlineQty = '<style>';
            // Headers cells
            inlineQty += '#mpex_order_table th {color: white; font-weight: bold; background-color: rgba(84, 109, 145, 1); height:50px}';

            // Links
            inlineQty += '#mpex_order_table a {color: #24385b;}';
            inlineQty += '</style>';

            inlineQty += '<table class="table" id="mpex_order_table">';
            inlineQty += '<thead>';
            inlineQty += '<tr>';
            inlineQty += '<th scope="col" id="table_title">Order Date</th>';
            inlineQty += '<th scope="col" id="table_title">Franchisee</th>';
            inlineQty += '<th scope="col" id="table_nb_products">B4 Envelope</th>';
            inlineQty += '<th scope="col" id="table_b4_prod" class="mpex1_header">C5 Envelope</th>';
            inlineQty += '<th scope="col" id="table_dl_prod" class="mpex1_header">DL Envelope</th>';
            inlineQty += '<th scope="col" id="table_c5_prod" class="mpex1_header">500g Satchel</th>';
            inlineQty += '<th scope="col" id="table_mpex_order" class="mpex1_header">1kg Satchel</th>';
            inlineQty += '<th scope="col" id="table_mpex_1" class="mpex1_header">3kg Satchel</th>';
            inlineQty += '<th scope="col" id="table_mpex_2" class="mpex1_header">5kg Satchel</th>';
            inlineQty += '</tr>';
            inlineQty += '</thead>';
            inlineQty += '<tbody>';
            inlineQty += '<tr class="total_row sum_row">';
            inlineQty += tableRowCells(id);
            inlineQty += '</tr></tr></tbody></table>';

            return inlineQty;
        }

        function formatDate(testDate){
            //console.log('testDate: '+testDate);
            var responseDate=format.format({value:testDate,type:format.Type.DATE});
            //console.log('responseDate: '+responseDate);
            return responseDate;
        }

        function tableRowCells(id) {
            var zeeRecord = record.load({
                type: record.Type.PARTNER,
                id: id,
                isDynamic: true
            });
            var name = zeeRecord.getValue({
                fieldId: 'companyname'
            });
            var b4 = zeeRecord.getValue({
                fieldId: 'custentity_mpex_b4'
            });
            var c5 = zeeRecord.getValue({
                fieldId: 'custentity_mpex_c5',
            });
            var dl = zeeRecord.getValue({
                fieldId: 'custentity_mpex_dl',
            });
            var g500 = zeeRecord.getValue({
                fieldId: 'custentity_mpex_500g',
            });
            var kg1 = zeeRecord.getValue({
                fieldId: 'custentity_mpex_1kg',
            });
            var kg3 = zeeRecord.getValue({
                fieldId: 'custentity_mpex_3kg',
            });
            var kg5 = zeeRecord.getValue({
                fieldId: 'custentity_mpex_5kg',
            });

            var today = new Date();
            today = formatDate(today);
            var inlineQty = '<td headers="table_nb_products" class="mpex1">' + today + '</td>';
            inlineQty += '<td headers="table_b4_prod" class="mpex1">' + name + '</td>';
            inlineQty += '<td headers="table_b4_prod" class="mpex1">' + b4 + ' (10-Packs)</td>';
            inlineQty += '<td headers="table_dl_prod" class="mpex1">' + c5 + ' (10-Packs)</td>';
            inlineQty += '<td headers="table_c5_prod" class="mpex1">' + dl + ' (10-Packs)</td>';
            inlineQty += '<td headers="table_mpex_order" class="mpex1">' + g500 + ' (10-Packs)</td>';
            inlineQty += '<td headers="table_mpex_1" class="mpex1">' + kg1 + ' (10-Packs)</td>';
            inlineQty += '<td headers="table_mpex_2" class="mpex1">' + kg3 + ' (10-Packs)</td>';
            inlineQty += '<td headers="table_mpex_2" class="mpex1">' + kg5 + ' (10-Packs)</td>';
        
            return inlineQty;
        }
        

        /**
         * The Franchisee dropdown list.
         * @param   {Number}    zee_id
         * @return  {String}    `inlineQty`
         */
        function franchiseeDropdownSection() {
            var inlineQty = '<div class="form-group container zee_dropdown_section >';

            inlineQty += '<div class="row">';
            // Franchisee dropdown field
            inlineQty += '<div class="col-xs-12 zee_dropdown_div">';
            inlineQty += '<div class="input-group col-xs-12">';
            inlineQty += '<span class="input-group-addon" id="zee_dropdown_text">FRANCHISEE</span>';
            inlineQty += '<select id="zee_dropdown" class="form-control" required>';
            inlineQty += '<option></option>';

            // Load the franchisees options
            var zeesSearch = search.load({
                id: 'customsearch_zee_mpex_product_order',
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


        return {
            onRequest: onRequest
        };
    }
);