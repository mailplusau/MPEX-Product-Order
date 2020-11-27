/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */

define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
    function(error, runtime, search, url, record, format, email, currentRecord) {
        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            var baseURL = 'https://1048144-sb3.app.netsuite.com';
        }
        var role = runtime.getCurrentUser().role;

        /**
         * On page initialisation
         */
        function pageInit() {
            if (role == 1000) { //franchisee
                $('div.col-xs-12.mpex_order_table_div').html(resultsTable());
                
            } else {
                var ordersDataSet = [];

                var invoice_datatable_inline_html = '<style>';
                invoice_datatable_inline_html += 'table#product_order-preview {font-size: 12px;text-align: center;border: none;}';
                invoice_datatable_inline_html += '.dataTables_wrapper {font-size: 14px;}';
                invoice_datatable_inline_html += 'table#product_order-preview th {text-align: center;}';
                invoice_datatable_inline_html += 'table#product_order-preview thead input {width: 100%;}';
                invoice_datatable_inline_html += '</style>';
                invoice_datatable_inline_html += '<table cellpadding="15" id="product_order-preview" class="table table-responsive table-striped customer tablesorter" cellspacing="0" style="width: 100%;">';
                invoice_datatable_inline_html += '<thead style="color: white;background-color: #607799;">';
                invoice_datatable_inline_html += '</thead>';
                invoice_datatable_inline_html += '<tbody id="result_orders"></tbody>';
                invoice_datatable_inline_html += '</table>';
                $('#mpex_orders_dt_div').html(invoice_datatable_inline_html);

                var orders_table = $('#product_order-preview').DataTable({
                    data: ordersDataSet,
                    columns: [
                        {title: "MP Internal ID"},
                        { title: "TOLL Account #" },
                        { title: "Account Name" },
                        { title: "DL Envelope" },
                        { title: "C5 Envelope" },
                        { title: "B4 Envelope" },
                        { title: "500g Satchel" },
                        { title: "1kg Satchel" },
                        { title: "3kg Satchel" },
                        { title: "5kg Satchel" },
                        { title: "Total" },
                        { title: "DX Address" },
                        { title: "DX Exchange" },
                        { title: "State" },
                        { title: "Postcode" }
                    ]
                    
                });
            
                $('#product_order-preview thead tr').addClass('text-center');
            
                // Adds a row to the table head row, and adds search filters to each column.
                $('#product_order-preview thead tr').clone(true).appendTo('#product_order-preview thead');
                $('#product_order-preview thead tr:eq(1) th').each(function (i) {
                    var title = $(this).text();
                    $(this).html('<input type="text" placeholder="Search ' + title + '" />');
            
                    $('input', this).on('keyup change', function () {
                        if (orders_table.column(i).search() !== this.value) {
                            orders_table
                                .column(i)
                                .search(this.value)
                                .draw();
                        }
                    });
                });

                updateOrdersTable();
                
            }
            
            
        }

        function resultsTable() {
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
            inlineQty += '<th scope="col" id="table_nb_invoices">B4 Envelope</th>';
            inlineQty += '<th scope="col" id="table_revenue" class="price_header">C5 Envelope</th>';
            inlineQty += '<th scope="col" id="table_revenue_tax" class="price_header">DL Envelope</th>';
            inlineQty += '<th scope="col" id="table_revenue_total" class="price_header">500g Satchel</th>';
            inlineQty += '<th scope="col" id="table_mpex_order" class="price_header">1kg Satchel</th>';
            inlineQty += '<th scope="col" id="table_mpex_order_tax" class="price_header">3kg Satchel</th>';
            inlineQty += '<th scope="col" id="table_mpex_order_total" class="price_header">5kg Satchel</th>';
            inlineQty += '</tr>';
            inlineQty += '</thead>';
            inlineQty += '<tbody>';
            inlineQty += '<tr class="total_row sum_row">';
            inlineQty += tableRowCells();
            inlineQty += '</tr></tr></tbody></table>';

            return inlineQty;
        }

        function tableRowCells() {
            var zee_id = 779884; //comment
            var zeeRecord = record.load({
                type: record.Type.PARTNER,
                id: zee_id,
                isDynamic: true
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
            var inlineQty = '<td headers="table_nb_invoices" class="price">' + today + '</td>';
            inlineQty += '<td headers="table_revenue" class="price">' + b4 + ' (10-Packs)</td>';
            inlineQty += '<td headers="table_revenue_tax" class="price">' + c5 + ' (10-Packs)</td>';
            inlineQty += '<td headers="table_revenue_total" class="price">' + dl + ' (10-Packs)</td>';
            inlineQty += '<td headers="table_mpex_order" class="price">' + g500 + ' (10-Packs)</td>';
            inlineQty += '<td headers="table_mpex_order_tax" class="price">' + kg1 + ' (10-Packs)</td>';
            inlineQty += '<td headers="table_mpex_order_total" class="price">' + kg3 + ' (10-Packs)</td>';
            inlineQty += '<td headers="table_mpex_order_total" class="price">' + kg5 + ' (10-Packs)</td>';
        
            return inlineQty;
        }
        
        function updateOrdersTable() {
            var compid = (runtime.EnvType == "SANDBOX") ? '1048144_SB3' : '1048144';
            var ordersSearchResults = loadZeeOrders();
            
            $('#result_orders').empty();
            var ordersDataSet = [];
            var ordersDataSet2 = [];
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

                var tollAcctNum = orderResult.getValue('custentity_toll_acc_number');
                    
               
                var accName = 'MailPlus-' + orderResult.getValue('companyname');

                var mpex_dl = orderResult.getValue('custentity_mpex_dl');
                var mpex_c5 = orderResult.getValue('custentity_mpex_c5');
                var mpex_b4 = orderResult.getValue('custentity_mpex_b4');
                var mpex_500g = orderResult.getValue('custentity_mpex_500g');
                var mpex_1kg = orderResult.getValue('custentity_mpex_1kg');
                var mpex_3kg = orderResult.getValue('custentity_mpex_3kg');
                var mpex_5kg = orderResult.getValue('custentity_mpex_5kg');
                var mpex1 = parseInt(mpex_dl);
                if (isNullorEmpty(mpex_dl)) {
                    mpex1 = 0;
                }
                var mpex2 = parseInt(mpex_c5);
                if (isNullorEmpty(mpex_c5)) {
                    mpex2 = 0;
                }
                var mpex3 = parseInt(mpex_b4);
                if (isNullorEmpty(mpex_b4)) {
                    mpex3 = 0;
                }
                var mpex4 = parseInt(mpex_500g);
                if (isNullorEmpty(mpex_500g)) {
                    mpex4 = 0;
                }
                var mpex5 = parseInt(mpex_1kg);
                if (isNullorEmpty(mpex_1kg)) {
                    mpex5 = 0;
                }
                var mpex6 = parseInt(mpex_3kg);
                if (isNullorEmpty(mpex_3kg)) {
                    mpex6 = 0;
                }
                var mpex7 = parseInt(mpex_5kg);
                if (isNullorEmpty(mpex_5kg)) {
                    mpex7 = 0;
                }

                var total = mpex1 + mpex2 + mpex3 + mpex4 + mpex5 + mpex6 + mpex7;
                
                
                var dxAddr = orderResult.getValue({
                    name: "custrecord_ap_lodgement_addr2",
                    join: "CUSTENTITY__TOLL_PICKUP_DX_NO",
                    label: "Address 2"
                 });
                
            
                var dxExch = orderResult.getValue({
                    name: "custrecord_ap_lodgement_suburb",
                    join: "CUSTENTITY__TOLL_PICKUP_DX_NO",
                    label: "Suburb"
                 });

                // custrecord_ap_lodgement_site_name
                var state = orderResult.getText({
                    name: "custrecord_ap_lodgement_site_state",
                    join: "CUSTENTITY__TOLL_PICKUP_DX_NO",
                    label: "State"
                 });
                var zip = orderResult.getValue({
                    name: "custrecord_ap_lodgement_postcode",
                    join: "CUSTENTITY__TOLL_PICKUP_DX_NO",
                    label: "Post Code"
                 });


                //var invoice_number = orderResult.getValue('invoicenum');
                //invoice_number = invoice_number.replace(re, '$1');
                //var invoice_id = orderResult.id;
                //var invoice_link = baseURL + '/app/accounting/transactions/custinvc.nl?id=' + invoice_id + '&compid=' + compid + '&cf=116&whence=';
                //invoice_number = '<a href="' + invoice_link + '">' + invoice_number + '</a>';

               

                console.log('orderResult : ', orderResult);
                console.log('vals: ', zeeId, tollAcctNum, accName, mpex_dl, mpex_c5, mpex_b4, mpex_500g, mpex_1kg, mpex_3kg, mpex_5kg, total, dxAddr, dxExch, state, zip)
                ordersDataSet.push([zeeId, tollAcctNum, accName, mpex_dl, mpex_c5, mpex_b4, mpex_500g, mpex_1kg, mpex_3kg, mpex_5kg, total, dxAddr, dxExch, state, zip]);
                var addr1 = "\"" + dxAddr + "\"";
                //var addr2 = "\"".addr1."\"";

                ordersDataSet2.push([zeeId, tollAcctNum, accName, mpex_dl, mpex_c5, mpex_b4, mpex_500g, mpex_1kg, mpex_3kg, mpex_5kg, total, addr1, dxExch, state, zip]);
                
                return true;

            });

            // Update datatable rows.
            var datatable = $('#product_order-preview').dataTable().api();
            datatable.clear();
            datatable.rows.add(ordersDataSet);
            datatable.draw();
            saveCsv(ordersDataSet2);
            $('[data-toggle="tooltip"]').tooltip();

            return true;
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

        function saveRecord(context) {
            if (role == 1000) {
                if (window.confirm('Are you sure you want to submit your order?')){
                    var b4 = checkNull($('#b4_text').val());
                    var c5 = checkNull($('#c5_text').val());
                    var dl = checkNull($('#dl_text').val());
                    var g500 = checkNull($('#500g_text').val());
                    var kg1 = checkNull($('#1kg_text').val());
                    var kg3 = checkNull($('#3kg_text').val());
                    var kg5 = checkNull($('#5kg_text').val());
        
                    var zee_id = 779884;
                    var zeeRecord = record.load({
                        type: record.Type.PARTNER,
                        id: zee_id,
                        isDynamic: true
                    });
        
                    zeeRecord.setValue({
                        fieldId: 'custentity_mpex_b4',
                        value: b4
                    });
                    zeeRecord.setValue({
                        fieldId: 'custentity_mpex_c5',
                        value: c5
                    });
                    zeeRecord.setValue({
                        fieldId: 'custentity_mpex_dl',
                        value: dl
                    });
                    zeeRecord.setValue({
                        fieldId: 'custentity_mpex_500g',
                        value: g500
                    });
                    zeeRecord.setValue({
                        fieldId: 'custentity_mpex_1kg',
                        value: kg1
                    });
                    zeeRecord.setValue({
                        fieldId: 'custentity_mpex_3kg',
                        value: kg3
                    });
                    zeeRecord.setValue({
                        fieldId: 'custentity_mpex_5kg',
                        value: kg5
                    });
        
                    zeeRecord.save({
                        ignoreMandatoryFields: true
                    });
                } else {
                    return false;
                }
            } 
            

            return true;
        }
        
        
        function onclick_back() {   
            //window.history.back();
            history.go(-1);
        }


        function checkNull(value) {
            if (isNullorEmpty(value)) {
                return 0;
            }
            return value;
        }

        function saveInfo(zee_id, b4, c5, dl, g500, kg1, kg3, kg5) {
            var zeeRecord = record.load({
                type: record.Type.PARTNER,
                id: zee_id,
                isDynamic: true
            });

            zeeRecord.setValue({
                fieldId: 'custentity_mpex_b4',
                value: b4
            });
            zeeRecord.setValue({
                fieldId: 'custentity_mpex_c5',
                value: c5
            });
            zeeRecord.setValue({
                fieldId: 'custentity_mpex_dl',
                value: dl
            });
            zeeRecord.setValue({
                fieldId: 'custentity_mpex_500g',
                value: g500
            });
            zeeRecord.setValue({
                fieldId: 'custentity_mpex_1kg',
                value: kg1
            });
            zeeRecord.setValue({
                fieldId: 'custentity_mpex_3kg',
                value: kg3
            });
            zeeRecord.setValue({
                fieldId: 'custentity_mpex_5kg',
                value: kg5
            });

            zeeRecord.save({
                ignoreMandatoryFields: true
            });
        }
        function onclick_submit() {
            
            var urlVar = "https://1048144-sb3.app.netsuite.com" + "/app/site/hosting/scriptlet.nl?script=1067&deploy=1";
            window.location.href = urlVar;

            
        }

        /**
         * Create the CSV and store it in the hidden field 'custpage_table_csv' as a string.
         * @param {Array} ordersDataSet The `billsDataSet` created in `loadDatatable()`.
         */
        function saveCsv(ordersDataSet) {
            var headers = ["MP Internal ID", "TOLL Account #", "Account Name", "DL Envelope", "C5 Envelope", "B4 Envelope", "500g Satchel", "1kg Satchel", "3kg Satchel", "5kg Satchel", "Total", "DX Address", "DX Exchange", "State", "Postcode"]
            headers = headers.slice(0, headers.length); // .join(', ')

            var csv = headers + "\n";
            
            ordersDataSet.forEach(function(row) {
                console.log("tesT"+ row);
                csv += row.join(',');
                csv += "\n";
            });

            var val1 = currentRecord.get();
            val1.setValue({
                fieldId: 'custpage_table_csv',
                value: csv
            });


            return true;
        }

        function formatDate(testDate){
            console.log('testDate: '+testDate);
            var responseDate=format.format({value:testDate,type:format.Type.DATE});
            console.log('responseDate: '+responseDate);
            return responseDate;
        }


        /**
         * Load the string stored in the hidden field 'custpage_table_csv'.
         * Converts it to a CSV file.
         * Creates a hidden link to download the file and triggers the click of the link.
         */
        function downloadCsv() {
            var today = new Date();
            today = formatDate(today);
            var val1 = currentRecord.get();
            var csv = val1.getValue({
                fieldId: 'custpage_table_csv',
            });
            today = replaceAll(today);
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            var content_type = 'text/csv';
            var csvFile = new Blob([csv], { type: content_type });
            var url = window.URL.createObjectURL(csvFile);
            var filename = 'MP Product Order_' + today + '.csv';
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);


        }
        
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

                var zeeRecord = record.load({
                    type: record.Type.PARTNER,
                    id: zeeId,
                    
                });
                
                zeeRecord.setValue({
                    fieldId: 'custentity_mpex_b4',
                    value: null
                });
                zeeRecord.setValue({
                    fieldId: 'custentity_mpex_c5',
                    value: null
                });
                zeeRecord.setValue({
                    fieldId: 'custentity_mpex_dl',
                    value: null
                });
                zeeRecord.setValue({
                    fieldId: 'custentity_mpex_500g',
                    value: null

                });
                zeeRecord.setValue({
                    fieldId: 'custentity_mpex_1kg',
                    value: null

                });
                zeeRecord.setValue({
                    fieldId: 'custentity_mpex_3kg',
                    value: null

                });
                zeeRecord.setValue({
                    fieldId: 'custentity_mpex_5kg',
                    value: null

                });
                
                return true;

            });
            alert('All Current Franchise orders have been cleared');
            
        }

        
        function replaceAll(string) {
            return string.split("/").join("-");
        }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            onclick_back: onclick_back,
            onclick_submit: onclick_submit,
            downloadCsv: downloadCsv,
            resetZeeOrders: resetZeeOrders
        };  
    }

    
);