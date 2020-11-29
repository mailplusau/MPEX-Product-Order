/**
 
 *@NApiVersion 2.0
 *@NScriptType Suitelet

 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format'], 
    function(ui, email, runtime, search, record, http, log, redirect, format) {
        var role = runtime.getCurrentUser().role;
        function onRequest(context) {  
            
            if (context.request.method === 'GET') {
                var inlineHtml = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
                inlineHtml += '<script src="http://code.jquery.com/jquery-1.11.3.min.js"></script>';
                // Load DataTables
                inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';
                inlineHtml += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
                inlineHtml += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';
                
                var form = ui.createForm({
                    title: 'MPEX Product Orders (ALL ZEEs)'
                });
                // Open Invoices Datatable
                inlineHtml += '<div class="form-group container mpex_orders mpex_orders_table">';
                inlineHtml += '<div class="row">';
                inlineHtml += '<div class="col-xs-24" id="mpex_orders_dt_div">';
                // It is inserted as inline html in the script mp_cl_open_ticket
                inlineHtml += '</div></div></div>';
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
        return {
            onRequest: onRequest
        };
    }
);