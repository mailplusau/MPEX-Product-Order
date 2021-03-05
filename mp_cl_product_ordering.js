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
        var tableSet = [];
        /**
         * On page initialisation
         */
        function pageInit() {

            var dataTable = $('#mpex_orders').DataTable({
                data: tableSet,
                columns: [
                    { title: 'Order Status'}, //0
                    { title: 'Order Date'}, //1
                    { title: 'Franchisee'}, //2
                    { title: 'B4 Envelope'}, // 3
                    { title: '500g Satchel'}, // 4 
                    { title: '1kg Satchel'}, // 5
                    { title: '3kg Satchel'}, // 6
                    { title: '5kg Satchel'}, // 7
                    //{ title: 'DX Address'}, // 
                    //{ title: 'DX Exchange'}, //
                    //{ title: 'State'}, //
                    //{ title: 'Postcode'}, //
                    { title: 'Connote #'}, // 8
                ],
                columnDefs: [{
                        targets: [0],
                        className: 'bolded'
                    }
                ],
                order: [[1, "desc"]],
                rowCallback: function(row, data) {
                    if (data[0] === 'Active' && isNullorEmpty(data[8])){
                        $(row).css('background-color', 'rgba(144, 238, 144, 0.75)'); // Salmon  
                    }
                } 
            });

            var currentScript = currentRecord.get();
            if (!isNullorEmpty(currentScript.getValue({fieldId: 'results'}))) {
                loadOrderRecord();
            }
            if (role == 1000 && isNullorEmpty(currentScript.getValue({fieldId: 'custpage_zee_selected'}))) {
                var zee = runtime.getCurrentUser().id;
                var currentScript = currentRecord.get();            
                console.log('loading');
                //prod = 1089, sb = 1140
                //var url = 'https://1048144-sb3.app.netsuite.com' + "/app/site/hosting/scriptlet.nl?script=1089&deploy=1";
               
                var url = baseURL + "/app/site/hosting/scriptlet.nl?script=1089&deploy=1";
                currentScript.setValue({
                    fieldId: 'custpage_zee_selected',
                    value: zee
                });  
                url += "&zee=" + Math.floor(zee) + "";
                window.location.href = url;

            }

            $(document).ready(function(){
                $("input").blur(function(){
                    var val = $(this).val();
                        if( val % 10 != 0){
                            var remainderVal = (val % 10);
                            var newVal = (val-remainderVal) + 10;
                            $(this).val(newVal);
                        }
                });
              });

            $(document).on('change', '.zee_dropdown', function(event) {
                var zee = $(this).val();
                var currentScript = currentRecord.get();            

                //prod = 1089, sb = 1140
                //var url = 'https://1048144-sb3.app.netsuite.com' + "/app/site/hosting/scriptlet.nl?script=1140&deploy=1";
                var url = baseURL + "/app/site/hosting/scriptlet.nl?script=1089&deploy=1";
                console.log(zee);
                currentScript.setValue({
                    fieldId: 'custpage_zee_selected',
                    value: zee
                }); 
                url += "&zee=" + Math.floor(zee) + "";
                window.location.href = url;

                 

               
            });           
      
        }

        
        function loadOrderRecord(){
            var currentScript = currentRecord.get();
            var zee = currentScript.getValue({ fieldId: 'custpage_zee_selected'});  
            var tableSet = [];

            var ordersSearch = search.load({
                id: 'customsearch_mpex_zee_order_search',
                type: 'customrecord_zee_mpex_order'
            });

            console.log(zee);
            ordersSearch.filters.push(search.createFilter({
                name: 'custrecord_mpex_order_franchisee',
                operator: search.Operator.IS,
                values: zee
            }));

            var ordersResultSet = ordersSearch.run();
            var inlineQty = '';
            ordersResultSet.each(function(searchResult) {
                var status = searchResult.getValue({ name: 'custrecord_mpex_order_status'});
                var date = searchResult.getValue({ name: 'lastmodified'});
                var zeeName = searchResult.getValue({ name: 'companyname', join: 'CUSTRECORD_MPEX_ORDER_FRANCHISEE'});
                var b4 = searchResult.getValue({ name: 'custrecord_mpex_order_b4'});
                var g500 = searchResult.getValue({ name: 'custrecord_mpex_order_500_satchel'});
                var kg1 = searchResult.getValue({ name: 'custrecord_mpex_order_1kg_satchel'});
                var kg3 = searchResult.getValue({ name: 'custrecord_mpex_order_3kg_satchel'});
                var kg5 = searchResult.getValue({ name: 'custrecord_mpex_order_5kg_satchel'});
                
                var dxAddr = searchResult.getValue({ name: 'custrecord_mpex_order_dx_addr'});
                var dxExch = searchResult.getValue({ name: 'custrecord_mpex_order_dx_exch'});
                var state = searchResult.getValue({ name: 'custrecord_mpex_order_state'});
                var zip = searchResult.getValue({ name: 'custrecord_mpex_order_postcode'});
                var connote = searchResult.getValue({ name: 'custrecord_mpex_order_connote'});
                
                if (status == 1) {
                    status = "Active";
                } else if (status == 2) {
                    status = "Processing";
                } else if (status == 3) {
                    status = "Completed";
                } else {
                    status = "Check with Head Office";
                }
                tableSet.push([status, date, zeeName, b4, g500, kg1, kg3,  kg5, connote]);

                return true;
            
            });

            console.log("tableset", tableSet);
            var datatable = $('#mpex_orders').DataTable();
            datatable.clear();
            datatable.rows.add(tableSet);
            datatable.draw();
            
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
                    console.log("INSIDE CONNOTEEE");
                    activeOrder = searchResult.getValue({ name: 'id'});
                    return false;
                }
                return true;
            });

            console.log(activeOrder);
            return activeOrder;
        }
        function saveRecord() {
            console.log("test");
            var currentScript = currentRecord.get();     
            console.log("test2");
       
            var zee_id = currentScript.getValue({ fieldId: 'custpage_zee_selected' });
            console.log(zee_id);
            zee_id = parseInt(zee_id);

            if (window.confirm('Are you sure you want to submit your order?')){
                var b4 = checkNull($('#b4_text').val());
                var g500 = checkNull($('#500g_text').val());
                var kg1 = checkNull($('#1kg_text').val());
                var kg3 = checkNull($('#3kg_text').val());
                var kg5 = checkNull($('#5kg_text').val());
                
                console.log(b4);
                currentScript.setValue({ fieldId: 'custpage_b4', value: b4 });
                currentScript.setValue({ fieldId: 'custpage_g500', value: g500 });
                currentScript.setValue({ fieldId: 'custpage_kg1', value: kg1});
                currentScript.setValue({ fieldId: 'custpage_kg3', value: kg3});
                currentScript.setValue({ fieldId: 'custpage_kg5', value: kg5});
                
                

            } else {
                return false;
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

        function onclick_submit() {
            //var urlVar = "https://1048144-sb3.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1067&deploy=1";
            var urlVar = "https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1089&deploy=1";
            var currentScript = currentRecord.get();            
            var zee_id = currentScript.getValue({ fieldId: 'custpage_zee_selected' });

            if (!isNullorEmpty(zee_id) && zee_id != 0) {
                urlVar += "&zee=" + Math.floor(zee_id) + "";
            }
            console.log(urlVar);

            window.location.href = urlVar;

        }

        
        function formatDate(testDate){
            console.log('testDate: '+testDate);
            var responseDate=format.format({value:testDate,type:format.Type.DATE});
            console.log('responseDate: '+responseDate);
            return responseDate;
        }


    
      

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            onclick_back: onclick_back,
            onclick_submit: onclick_submit,
        };  
    }

    
);