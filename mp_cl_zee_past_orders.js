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
            
            if (!isNullorEmpty(currentScript.getValue({fieldId: 'custpage_zee_selected'}))) {
                console.log("testing");
                loadOrderRecord();

            }
            
            if (role == 1000 && isNullorEmpty(currentScript.getValue({fieldId: 'custpage_zee_selected'}))) {
                var zee = runtime.getCurrentUser().id;
                var currentScript = currentRecord.get();            
                console.log('loading');
                //prod = 1089, sb = 1140
                //var url = 'https://1048144-sb3.app.netsuite.com' + "/app/site/hosting/scriptlet.nl?script=1089&deploy=1";
               
                var url = baseURL + "/app/site/hosting/scriptlet.nl?script=1178&deploy=1";
                currentScript.setValue({
                    fieldId: 'custpage_zee_selected',
                    value: zee
                });  
                url += "&zee=" + Math.floor(zee) + "";
                window.location.href = url;

            }

            $(document).on('change', '.zee_dropdown', function(event) {
                var zee = $(this).val();
                var currentScript = currentRecord.get();            

                //prod = 1089, sb = 1140
                //var url = 'https://1048144-sb3.app.netsuite.com' + "/app/site/hosting/scriptlet.nl?script=1140&deploy=1";
                var url = baseURL + "/app/site/hosting/scriptlet.nl?script=1178&deploy=1";
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

        function saveRecord() {
             
            //return true;
        }
        
        
        function onclick_back() {   
            //window.history.back();
            history.go(-1);
        }

        
        function formatDate(testDate){
            console.log('testDate: '+testDate);
            var responseDate=format.format({value:testDate,type:format.Type.DATE});
            console.log('responseDate: '+responseDate);
            return responseDate;
        }

        function onclick_new_order() {
            var url = baseURL + "/app/site/hosting/scriptlet.nl?script=1089&deploy=1";
            window.open(url, "_blank");
        }


    
      

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            onclick_back: onclick_back,
            onclick_new_order: onclick_new_order,

        };  
    }

    
);