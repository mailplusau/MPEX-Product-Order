/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */

define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
    function(error, runtime, search, url, record, format, email, currentRecord) {
        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }
        var role = runtime.getCurrentUser().role;

        /**
         * On page initialisation
         */
        function pageInit() {
            var ordersDataSet = [];

            var invoice_datatable_inline_html = '<style>';
            invoice_datatable_inline_html += 'table#product_order-preview {font-size: 12px;text-align: center;border: none;}';
            invoice_datatable_inline_html += '.dataTables_wrapper {font-size: 14px;}';
            invoice_datatable_inline_html += 'table#product_order-preview th {text-align: center;}.bolded{font-weight: bold;}</style>';
            invoice_datatable_inline_html += '<table cellpadding="15" id="product_order-preview" class="table table-responsive table-striped customer tablesorter" style="width: 100%;">';
            invoice_datatable_inline_html += '<thead style="color: white;background-color: #607799;">';
            invoice_datatable_inline_html += '</thead>';
            invoice_datatable_inline_html += '<tbody id="result_orders"></tbody>';
            invoice_datatable_inline_html += '</table>';
            $('#mpex_orders_dt_div').html(invoice_datatable_inline_html);

            var orders_table = $('#product_order-preview').DataTable({
                data: ordersDataSet,
                columns: [
                    { title: "Date"},           //0
                    { title: "MP Internal ID"}, //1
                    { title: "TOLL Account #" },//2
                    { title: "Account Name" },  //3
                    { title: "B4 Envelope" },   //4
                    { title: "500g Satchel" },  //5
                    { title: "1kg Satchel" },   //6
                    { title: "3kg Satchel" },   //7
                    { title: "5kg Satchel" },   //8
                    { title: "Total" },         //9
                    { title: "DX Address" },    //10
                    { title: "DX Exchange" },   //11
                    { title: "State" },         //12
                    { title: "Postcode" },      //13
                    { title: "Connote #"}       //14
                ],
                order: [[3, "asc"]],
                
            });
        
            $('#product_order-preview thead tr').addClass('text-center');
        
            updateOrdersTable();

            $(document).ready(function(){

                $("#process_order").click(function(){
                   alert("Please wait while all active orders are processed");
                   $('.progress').addClass('show');
                   setTimeout(function(){ processMove(); }, 100);
                });
            });      
        }

        function processMove() {
            var currentScript = currentRecord.get();
            var initial_count = currentScript.getValue({fieldId: 'numActive'});
            
            
            console.log("initial", initial_count);
            var totalTime = initial_count*20;
            console.log("total", totalTime);
            var elem = document.getElementById("progress-records");
            var width = 0;
            var id = setInterval(frame, totalTime);
            function frame() {
                if (width >= 95) {
                    clearInterval(id);
                    deleteProgress(initial_count);
                    
                } else {
                    width++;
                    elem.style.width = width + "%";
                    elem.innerHTML = width + "%";
                }
            }
        }


        function updateOrdersTable() {

            $('#result_orders').empty();

            var zeeIdSet = [];
            var ordersDataSet = [];

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
                var status = searchResult.getValue({ name: 'custrecord_mpex_order_status'});
                var connote = searchResult.getValue({ name: 'custrecord_mpex_order_connote'});
                var zeeId =   searchResult.getValue({name: "custrecord_mpex_order_franchisee"});

                if (status == 1 && isNullorEmpty(connote) && zeeIdSet.indexOf(zeeId) == -1) {
                    zeeIdSet.push(zeeId);
                    var date = searchResult.getValue({name: "custrecord_mpex_order_date" });
                    var tollAcctNum = searchResult.getValue({name: "custrecord_mpex_order_toll_acc_num" });
                    var accName = 'MailPlus-' + searchResult.getValue({name: "companyname", join: "CUSTRECORD_MPEX_ORDER_FRANCHISEE" });
                    var mpex_b4 = searchResult.getValue({name: "custrecord_mpex_order_b4" });
                    var mpex_500g = searchResult.getValue({name: "custrecord_mpex_order_500_satchel" });
                    var mpex_1kg = searchResult.getValue({name: "custrecord_mpex_order_1kg_satchel" });
                    var mpex_3kg = searchResult.getValue({name: "custrecord_mpex_order_3kg_satchel" });
                    var mpex_5kg = searchResult.getValue({name: "custrecord_mpex_order_5kg_satchel" });
                    var total = parseInt(mpex_b4) + parseInt(mpex_500g) + parseInt(mpex_1kg) + parseInt(mpex_3kg) + parseInt(mpex_5kg);

                    var dxAddr = searchResult.getValue({name: "custrecord_mpex_order_dx_addr" });
                    var dxExch = searchResult.getValue({name: "custrecord_mpex_order_dx_exch" });
                    var state = searchResult.getValue({name: "custrecord_mpex_order_state" });
                    var zip = searchResult.getValue({name: "custrecord_mpex_order_postcode" });
                    var connote = '';
                    ordersDataSet.push([date, zeeId, tollAcctNum, accName, mpex_b4, mpex_500g, mpex_1kg, mpex_3kg, mpex_5kg, total, dxAddr, dxExch, state, zip, connote]);

                }
                return true;
            });


            var zeeSearch = search.load({
                id: 'customsearch_zee_mpex_product_order',
                type: search.Type.PARTNER
            });

            var ordersSearchResults = zeeSearch.run();
            
            ordersSearchResults.each(function(orderResult) {

                var zeeId = orderResult.getValue('internalid');
                if (zeeIdSet.indexOf(zeeId) == -1) {
                    zeeIdSet.push(zeeId);
                    var tollAcctNum = orderResult.getValue('custentity_toll_acc_number');
                    var accName = 'MailPlus-' + orderResult.getValue('companyname');

                    var mpex_b4 = '';
                    var mpex_500g = '';
                    var mpex_1kg = '';
                    var mpex_3kg = '';
                    var mpex_5kg = '';

                    var total = 0;
                    
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
                    var date = formatDate(new Date());
                    var connote = '';
                    console.log('orderResult : ', orderResult);
                    console.log('vals: ', zeeId, tollAcctNum, accName, mpex_b4, mpex_500g, mpex_1kg, mpex_3kg, mpex_5kg, total, dxAddr, dxExch, state, zip)
                    ordersDataSet.push([date, zeeId, tollAcctNum, accName, mpex_b4, mpex_500g, mpex_1kg, mpex_3kg, mpex_5kg, total, dxAddr, dxExch, state, zip, connote]);
                }
                
                
                return true;

            });

            // Update datatable rows.
            var datatable = $('#product_order-preview').dataTable().api();
            datatable.clear();
            datatable.rows.add(ordersDataSet);
            datatable.draw();
            saveCsv(ordersDataSet);
            $('[data-toggle="tooltip"]').tooltip();

            return true;
        }

        function checkActive(zee) {
            var zeeSearch = search.load({
                id: 'customsearch_mpex_zee_order_search',
                type: 'customrecord_zee_mpex_order'
            });
            
            zeeSearch.filters.push(search.createFilter({
                name: 'custrecord_mpex_order_franchisee',
                operator: search.Operator.IS,
                values: zee
            }));

            zeeSearch.filters.push(search.createFilter({
                name: 'custrecord_mpex_order_status',
                operator: search.Operator.IS,
                values: 1
            }));

            
            var zeeResultSet = zeeSearch.run();
            var activeOrder = 0;

            zeeResultSet.each(function(searchResult) {
                var connote = searchResult.getValue({ name: 'custrecord_mpex_order_connote'});
                var status = searchResult.getValue({ name: 'custrecord_mpex_order_status'});
                
                if (status == 1 && isNullorEmpty(connote)) {
                    activeOrder = searchResult.getValue({ name: 'id'});
                    mpex_b4 = mpexOrder.getValue({fieldId: "custrecord_mpex_order_b4" });
                    mpex_500g = mpexOrder.getValue({fieldId: "custrecord_mpex_order_500_satchel" });
                    mpex_1kg = mpexOrder.getValue({fieldId: "custrecord_mpex_order_1kg_satchel" });
                    mpex_3kg = mpexOrder.getValue({fieldId: "custrecord_mpex_order_3kg_satchel" });
                    mpex_5kg = mpexOrder.getValue({fieldId: "custrecord_mpex_order_5kg_satchel" });
                    return false;
                }
                return true;
            });
            
            return activeOrder;
            
        }
        function saveRecord(context) {

            return true;
        }
        

        /**
         * Create the CSV and store it in the hidden field 'custpage_table_csv' as a string.
         * @param {Array} ordersDataSet The `billsDataSet` created in `loadDatatable()`.
         */
        function saveCsv(ordersDataSet) {
            var sep = "sep=;";
            var headers = ["Date", "MP Internal ID", "TOLL Account #", "Account Name", "B4 Envelope", "500g Satchel", "1kg Satchel", "3kg Satchel", "5kg Satchel", "Total", "DX Address", "DX Exchange", "State", "Postcode", "Connote #"]
            headers = headers.join(';'); // .join(', ')

            var csv = sep + "\n" + headers + "\n";
            
            ordersDataSet.forEach(function(row) {
                row = row.join(';');
                console.log("tesT"+ row);
                csv += row;
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
        
        
        
        function replaceAll(string) {
            return string.split("/").join("-");
        }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            downloadCsv: downloadCsv,
        };  
    }

    
);