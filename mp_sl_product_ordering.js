/**
 
 *@NApiVersion 2.0
 *@NScriptType Suitelet

 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format'],
  function (ui, email, runtime, search, record, http, log, redirect, format) {
    var role = runtime.getCurrentUser().role;

    function onRequest(context) {
      var b4 = '';
      var g500 = '';
      var kg1 = '';
      var kg3 = '';
      var kg5 = '';
      var g500_toll = '';
      var kg1_toll = '';
      var kg3_toll = '';
      var kg5_toll = '';
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
          var b4 = '';
          var g500 = '';
          var kg1 = '';
          var kg3 = '';
          var kg5 = '';
          var g500_toll = '';
          var kg1_toll = '';
          var kg3_toll = '';
          var kg5_toll = '';
          zeeResultSet.each(function (searchResult) {
            var connote = searchResult.getValue({
              name: 'custrecord_mpex_order_connote'
            });
            var status = searchResult.getValue({
              name: 'custrecord_mpex_order_status'
            });

            if (status == 1 && isNullorEmpty(connote)) {
              activeOrder = searchResult.getValue({
                name: 'id'
              });
              b4 = searchResult.getValue({
                name: "custrecord_mpex_order_b4"
              });
              g500 = searchResult.getValue({
                name: "custrecord_mpex_order_500_satchel"
              });
              kg1 = searchResult.getValue({
                name: "custrecord_mpex_order_1kg_satchel"
              });
              kg3 = searchResult.getValue({
                name: "custrecord_mpex_order_3kg_satchel"
              });
              kg5 = searchResult.getValue({
                name: "custrecord_mpex_order_5kg_satchel"
              });
              g500_toll = searchResult.getValue({
                name: "custrecord_mpex_order_500_satchel_toll"
              });
              kg1_toll = searchResult.getValue({
                name: "custrecord_mpex_order_1kg_satchel_toll"
              });
              kg3_toll = searchResult.getValue({
                name: "custrecord_mpex_order_3kg_satchel_toll"
              });
              kg5_toll = searchResult.getValue({
                name: "custrecord_mpex_order_5kg_satchel_toll"
              });
              test = true;
              return false;
            }
            return true;
          });

        }

        //Instructions
        inlineHtml += instructionsBox();

        if (role != 1000) {
          inlineHtml += franchiseeDropdownSection(context.request.parameters.zee);
        }

      

        //Heading
        inlineHtml += '<div class="form-group container toll_product_order_section">';
        inlineHtml += '<div class="row">';
        inlineHtml += '<div class="col-xs-12 heading1"><h4><span style="background-color: #379E8F;" class="label label-default col-xs-12">TOLL PRODUCTS</span></h4></div>';
        inlineHtml += '</div>';
        inlineHtml += '</div>';

        inlineHtml += inputFieldsToll(g500_toll, kg1_toll, kg3_toll, kg5_toll, test);

          //Heading
          inlineHtml += '<div class="form-group container product_order_section">';
          inlineHtml += '<div class="row">';
          inlineHtml += '<div class="col-xs-12 heading1"><h4><span style="background-color: #379E8F;" class="label label-default col-xs-12">TOLL PADDED PRODUCTS</span></h4></div>';
          inlineHtml += '</div>';
          inlineHtml += '</div>';
  
  
  
          inlineHtml += inputFieldsTollPadded(g500, kg1, kg3, test);

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

        form.addField({
          id: 'custpage_g500_toll',
          type: ui.FieldType.TEXT,
          label: 'g500_toll'
        }).updateDisplayType({
          displayType: ui.FieldDisplayType.HIDDEN
        });

        form.addField({
          id: 'custpage_kg1_toll',
          type: ui.FieldType.TEXT,
          label: 'kg1_toll'
        }).updateDisplayType({
          displayType: ui.FieldDisplayType.HIDDEN
        });

        form.addField({
          id: 'custpage_kg3_toll',
          type: ui.FieldType.TEXT,
          label: 'kg3_toll'
        }).updateDisplayType({
          displayType: ui.FieldDisplayType.HIDDEN
        });

        form.addField({
          id: 'custpage_kg5_toll',
          type: ui.FieldType.TEXT,
          label: 'kg5_toll'
        }).updateDisplayType({
          displayType: ui.FieldDisplayType.HIDDEN
        });

        form.addSubmitButton({
          label: 'SUBMIT ORDER'
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
        var g500_toll = context.request.parameters.custpage_g500_toll;
        var kg1_toll = context.request.parameters.custpage_kg1_toll;
        var kg3_toll = context.request.parameters.custpage_kg3_toll;
        // var kg5_toll = context.request.parameters.custpage_kg5_toll;

        createCustomRecord(zee_id, b4, g500, kg1, kg3, kg5, kg1_toll, kg3_toll, 0, g500_toll);
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
          id: 'submit',
          label: 'CHANGE ORDER',
          functionName: 'onclick_submit()'
        });
        form.clientScriptFileId = 4509791; //SB cl_id =4242817, PROD cl_id = 4509791
        context.response.writePage(form);

      }


    }

    function createCustomRecord(zee_id, b4, g500, kg1, kg3, kg5, kg1_toll, kg3_toll, kg5_toll, g500_toll) {
      var activeOrder = checkConnote(zee_id);
      //Load active order if it exists
      if (activeOrder != 0) {
        var mpexOrderRec = record.load({
          type: 'customrecord_zee_mpex_order',
          id: activeOrder
        });
        var date = new Date();
        date.setDate(date.getDate() + 1);
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_b4',
          value: b4
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_500_satchel',
          value: g500
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_1kg_satchel',
          value: kg1
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_3kg_satchel',
          value: kg3
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_5kg_satchel',
          value: kg5
        });
        mpexOrderRec.setValue({
            fieldId: 'custrecord_mpex_order_500_satchel_toll',
            value: g500_toll
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_1kg_satchel_toll',
          value: kg1_toll
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_3kg_satchel_toll',
          value: kg3_toll
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_5kg_satchel_toll',
          value: 0
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_total',
          value: b4 + g500 + kg1 + kg3 + kg5 + kg1_toll + kg3_toll + 0 + g500_toll
        });
        //mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_date', value: date});

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

        var tollAcctNum;
        var dxAddr;
        var dxExch;
        var state;
        var zip;
        zeeResultSet.each(function (searchResult) {
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
        date.setDate(date.getDate() + 1);
        //date.toLocaleString('en-AU', 'Australia/Sydney');
        //1 = ACTIVE, 2 = PROCESSING, 3 = COMPLETED (if connote)
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_status',
          value: 1
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_franchisee',
          value: zee_id
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_b4',
          value: b4
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_500_satchel',
          value: g500
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_1kg_satchel',
          value: kg1
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_3kg_satchel',
          value: kg3
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_5kg_satchel',
          value: kg5
        });

        mpexOrderRec.setValue({
            fieldId: 'custrecord_mpex_order_500_satchel_toll',
            value: g500_toll
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_1kg_satchel_toll',
          value: kg1_toll
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_3kg_satchel_toll',
          value: kg3_toll
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_5kg_satchel_toll',
          value: kg5_toll
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_total',
          value: b4 + g500 + kg1 + kg3 + kg5 + kg1_toll + kg3_toll + kg5_toll + g500_toll
        });

        //mpexOrderRec.setValue({fieldId: 'custrecord_mpex_order_date', value: date });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_mp_id',
          value: zee_id
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_toll_acc_num',
          value: tollAcctNum
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_dx_addr',
          value: dxAddr
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_dx_exch',
          value: dxExch
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_state',
          value: state
        });
        mpexOrderRec.setValue({
          fieldId: 'custrecord_mpex_order_postcode',
          value: zip
        });

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
      zeeResultSet.each(function (searchResult) {
        var connote = searchResult.getValue({
          name: 'custrecord_mpex_order_connote'
        });
        var status = searchResult.getValue({
          name: 'custrecord_mpex_order_status'
        });
        if (status == 1 && isNullorEmpty(connote)) {
          log.debug({
            title: 'INSIDE CONNOTEEE',
            details: 'INSIDE CONNOTEEE'
          });
          activeOrder = searchResult.getValue({
            name: 'id'
          });
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
      inlineQty += '<div style=\"background-color: #CFE0CE !important;border: 1px solid #379E8F;padding: 20px 30px 30px 30px\">';
      inlineQty += 'Complete this form to reorder packs of MPEX product stock for MailPlus Products (manual use with pre-printed labels) or TOLL Products, which require the customer to apply a TOLL Common label to ship—interested in biodegradable satchels? You can also direct customers to save up to 36% with our new biodegradable option with BetterPackaging. Find out more here: <a href=\"https://mailplus.com.au/discounted-biodegradable-satchels/\">Biodegradable Satchels</a>. Note the "<b>Dirt bags</b>" must be purchased separately.';
      inlineQty += "<br></br><b><u>Form Instructions:</u></b>"
      inlineQty += '</br><b>Entering Quantities: </b>'
      inlineQty += '<ul><li>You may only enter numbers into the relevant fields. Entering text will result in an input error, and you will need to re-enter the quantity using numbers only.</li>';
      inlineQty += '<li>You may also use the up and down arrows on the far right-hand side of each field to set the number of packs you require</li>';
      inlineQty += '<li>You are not required to fill out every box if you don\'t require every product.</li>';
      inlineQty += '</ul>';
      inlineQty += '</br><b>Product Types and Packs</b>'
      inlineQty += '<ul><b><u>MailPlus Product</u></b>: All Mailplus products come in a 10-pack. Please enter the number of 10-packs you require for each product type. The minimum number you can order is 10 x 10-pack = 100 items.';
      inlineQty += '<b><u>TOLL Product</u></b>: All TOLL products come in a 5-pack. Please enter the number of 5-packs you require for each product type. The minimum number you can order is 10 x 5-pack = 50 items. ';
      // inlineQty += '<p style="color: red;"><b><u>Please note</u></b>: The 500g satchel for TOLL Products is discontinued. Customers can use other product stock to ship a <500g item by applying the 500g TOLL COMMON Label through the MailPlus portal to a different product type like a 1kg satchel. The current 500g rate will apply, provided the item is less than 500g and the 500g rate was selected.</p>';
      inlineQty += '</ul>'
      inlineQty += '</br><b>Placing the Order</b>'
      inlineQty += '<ul>'
      inlineQty += '<li><b><u>SUBMIT</u></b>: Press the "SUBMIT Order" button at the top of the screen to submit your order and continue to the confirmation page.</li>'
      inlineQty += '</ul></div></div><br/>';



      return inlineQty;
    }

    function inputFields(b4, g500, kg1, kg3, kg5, test) {
      //Add Break
      //var inlineQty = '<div class="form-group container break_section"><div class="row"></div></div>'

      //500g AND B4 Options
      var inlineQty = '<div class="form-group container g500_section">';
      inlineQty += '<div class="row">';
      if (test) {
        inlineQty += '<div class="col-xs-6 g500_env"><div class="input-group"><span class="input-group-addon" id="500g">500G SATCHEL (PACKS OF 10)  </span><input id="500g_text" type="number" min="0" step="10" class="form-control 500g"   value="' + g500 + '"/></div></div>';
        inlineQty += '<div class="col-xs-6 b4_env"><div class="input-group"><span class="input-group-addon" id="b4">B4 ENVELOPE (PACKS OF 10)    </span><input id="b4_text" type="number" min="0" step="10" class="form-control b4"   value="' + b4 + '"/></div></div>';

      } else {
        inlineQty += '<div class="col-xs-6 g500_env"><div class="input-group"><span class="input-group-addon" id="500g">500G SATCHEL (PACKS OF 10)  </span><input id="500g_text" type="number" min="0" step="10" class="form-control 500g"   placeholder="Enter quantity" value="' + g500 + '"/></div></div>';
        inlineQty += '<div class="col-xs-6 b4_env"><div class="input-group"><span class="input-group-addon" id="b4">B4 ENVELOPE (PACKS OF 10)   </span><input id="b4_text" type="number" min="0" step="10" class="form-control b4"   placeholder="Enter quantity" value="' + b4 + '"/></div></div>';

      }
      inlineQty += '</div>';
      inlineQty += '</div>';

      //1KG
      inlineQty += '<div class="form-group container b4_section">';
      inlineQty += '<div class="row">';
      if (test) {
        inlineQty += '<div class="col-xs-6 kg1_env"><div class="input-group"><span class="input-group-addon" id="1kg">1KG SATCHEL (PACKS OF 10)    </span><input id="1kg_text" type="number" min="0" step="10" class="form-control 1kg"  value="' + kg1 + '"/></div></div>';


      } else {
        inlineQty += '<div class="col-xs-6 kg1_env"><div class="input-group"><span class="input-group-addon" id="1kg">1KG SATCHEL (PACKS OF 10)    </span><input id="1kg_text" type="number" min="0" step="10" class="form-control 1kg"  placeholder="Enter quantity"value="' + kg1 + '"/></div></div>';


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

      //5KG options
      inlineQty += '<div class="form-group container c5_section">';
      inlineQty += '<div class="row">';
      if (test) {
        inlineQty += '<div class="col-xs-6 kg5_env"><div class="input-group"><span class="input-group-addon" id="5kg">5KG SATCHEL (PACKS OF 10)  </span><input id="5kg_text" type="number" min="0" step="10" class="form-control 5kg"   value="' + kg5 + '"/></div></div>';

      } else {
        inlineQty += '<div class="col-xs-6 kg5_env"><div class="input-group"><span class="input-group-addon" id="5kg">5KG SATCHEL (PACKS OF 10)  </span><input id="5kg_text" type="number" min="0" step="10" class="form-control 5kg"   placeholder="Enter quantity" value="' + kg5 + '"/></div></div>';

      }
      inlineQty += '</div>';
      inlineQty += '</div>';


      return inlineQty;
    }

    function inputFieldsTollPadded(g500, kg1, kg3, test) {
      //Add Break
      //var inlineQty = '<div class="form-group container break_section"><div class="row"></div></div>'

      //500g AND B4 Options
      var inlineQty = '<div class="form-group container g500_section">';
      inlineQty += '<div class="row">';
      if (test) {
        inlineQty += '<div class="col-xs-6 g500_env"><div class="input-group"><span class="input-group-addon" id="500g">500G PADDED SATCHEL (PACKS OF 10)  </span><input id="500g_text_padded" type="number" min="10" step="10" class="form-control 500g_padded"   value="' + g500 + '"/></div></div>';

      } else {
        inlineQty += '<div class="col-xs-6 g500_env"><div class="input-group"><span class="input-group-addon" id="500g">500G PADDED SATCHEL (PACKS OF 10)  </span><input id="500g_text_padded" type="number" min="10" step="10" class="form-control 500g_padded"   placeholder="Enter quantity" value="' + g500 + '"/></div></div>';

      }
      inlineQty += '</div>';
      inlineQty += '</div>';

      //1KG
      inlineQty += '<div class="form-group container b4_section">';
      inlineQty += '<div class="row">';
      if (test) {
        inlineQty += '<div class="col-xs-6 kg1_env"><div class="input-group"><span class="input-group-addon" id="1kg_padded">1KG PADDED SATCHEL (PACKS OF 10)    </span><input id="1kg_text_padded" type="number" min="10" step="10" class="form-control 1kg_padded"  value="' + kg1 + '"/></div></div>';


      } else {
        inlineQty += '<div class="col-xs-6 kg1_env"><div class="input-group"><span class="input-group-addon" id="1kg">1KG PADDED SATCHEL (PACKS OF 10)    </span><input id="1kg_text_padded" type="number" min="10" step="10" class="form-control 1kg_padded"  placeholder="Enter quantity"value="' + kg1 + '"/></div></div>';


      }
      inlineQty += '</div>';
      inlineQty += '</div>';

      //3KG options
      inlineQty += '<div class="form-group container c5_section">';
      inlineQty += '<div class="row">';
      if (test) {
        inlineQty += '<div class="col-xs-6 kg3_env"><div class="input-group"><span class="input-group-addon" id="3kg">3KG PADDED SATCHEL (PACKS OF 10)</span><input id="3kg_text_padded" type="number" min="10" step="10" class="form-control 3kg_padded"   value="' + kg3 + '"/></div></div>';

      } else {
        inlineQty += '<div class="col-xs-6 kg3_env"><div class="input-group"><span class="input-group-addon" id="3kg">3KG PADDED SATCHEL (PACKS OF 10)</span><input id="3kg_text_padded" type="number" min="10" step="10" class="form-control 3kg_padded"   placeholder="Enter quantity" value="' + kg3 + '"/></div></div>';

      }
      inlineQty += '</div>';
      inlineQty += '</div>';


      return inlineQty;
    }

    function inputFieldsToll(g500, kg1, kg3, kg5, test) {
      //Add Break
      //var inlineQty = '<div class="form-group container break_section"><div class="row"></div></div>'

      //500g AND 5KG Options
      var inlineQty = '<div class="form-group container g500_section_toll">';
      inlineQty += '<div class="row">';
      if (test) {
        inlineQty += '<div class="col-xs-6 kg1_env_toll"><div class="input-group"><span class="input-group-addon" id="1kg">1KG SATCHEL    </span><input id="1kg_text_toll" type="number" min="0" step="5" class="form-control 1kg"  value="' + kg1 + '"/></div></div>';
        inlineQty += '<div class="col-xs-6 g500_env_toll"><div class="input-group"><span class="input-group-addon" id="500g">500G SATCHEL  </span><input id="500g_text_toll" type="number" min="0" step="5" class="form-control 500g"  value="' + g500 + '" /></div></div>';

      } else {
        inlineQty += '<div class="col-xs-6 kg1_env_toll"><div class="input-group"><span class="input-group-addon" id="1kg">1KG SATCHEL    </span><input id="1kg_text_toll" type="number" min="0" step="5" class="form-control 1kg"  placeholder="Enter quantity"value="' + kg1 + '"/></div></div>';
        inlineQty += '<div class="col-xs-6 g500_env_toll"><div class="input-group"><span class="input-group-addon" id="500g">500G SATCHEL  </span><input id="500g_text_toll" type="number" min="0" step="5" class="form-control 500g"  placeholder="Enter quantity" value="' + g500 + '" /></div></div>';

      }
      inlineQty += '</div>';
      inlineQty += '</div>';

      //1KG and B4 options
      inlineQty += '<div class="form-group container b4_section_toll">';
      inlineQty += '<div class="row">';
      if (test) {
        inlineQty += '<div class="col-xs-6 kg3_env_toll"><div class="input-group"><span class="input-group-addon" id="3kg">3KG SATCHEL</span><input id="3kg_text_toll" type="number" min="0" step="5" class="form-control 3kg"   value="' + kg3 + '"/></div></div>';


      } else {
        inlineQty += '<div class="col-xs-6 kg3_env_toll"><div class="input-group"><span class="input-group-addon" id="3kg">3KG SATCHEL</span><input id="3kg_text_toll" type="number" min="0" step="5" class="form-control 3kg"   placeholder="Enter quantity" value="' + kg3 + '"/></div></div>';


      }
      inlineQty += '</div>';
      inlineQty += '</div>';

      //1KG and B4 options
      inlineQty += '<div class="form-group container b4_section_toll">';
      inlineQty += '<div class="row">';
      if (test) {

        inlineQty += '<div class="col-xs-6 kg5_env_toll"><div class="input-group"><span class="input-group-addon" id="5kg">5KG SATCHEL  </span><input id="5kg_text_toll" type="number" min="0" step="5" class="form-control 5kg"   value="' + kg5 + '"/></div></div>';

      } else {

        inlineQty += '<div class="col-xs-6 kg5_env_toll"><div class="input-group"><span class="input-group-addon" id="5kg">5KG SATCHEL  </span><input id="5kg_text_toll" type="number" min="0" step="5" class="form-control 5kg"   placeholder="Enter quantity" value="' + kg5 + '"/></div></div>';

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
      inlineQty += '<thead style="color: white;background-color: #379E8F;">';
      inlineQty += '<tr class="text-center">';
      inlineQty += '</tr>';
      inlineQty += '</thead>';

      inlineQty += '<tbody id="result_import" class="result-import"></tbody>';

      inlineQty += '</table>';
      return inlineQty;
    }

    function formatDate(testDate) {
      //console.log('testDate: '+testDate);
      var responseDate = format.format({
        value: testDate,
        type: format.Type.DATE
      });
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