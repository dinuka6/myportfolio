
        window.addEventListener("load", initialize);

        //Initializing Functions --finish

        function initialize() {

            $('[data-toggle="tooltip"]').tooltip();     //tool tip unable

            btnAdd.addEventListener("click",btnAddMC);      //button walata event handler bind karala
            btnClear.addEventListener("click",btnClearMC);
            btnUpdate.addEventListener("click",btnUpdateMC);

            txtSearchName.addEventListener("keyup",btnSearchMC);

            privilages = httpRequest("../privilage?module=EVENTDETAIL","GET");

            //drop down ena than walata data genna gananna
            eventtypes = httpRequest("../eventtype/list","GET");
            eventstastusts = httpRequest("../eventstatus/list","GET");
            employees = httpRequest("../employee/list","GET");

            valid = "2px solid green";
            invalid = "2px solid red";
            initial = "2px solid #38040EFF";
            updated = "2px solid #ffcf56";
            active = "#538d22";

            //load view side
            loadView();

            //refresh form
           loadForm();


          //  changeTab('form');
        }

        function loadView() {
            //Search Area
            txtSearchName.value="";
            txtSearchName.style.background = "";

            //Table Area
            activerowno = "";
            activepage = 1;
            var query = "&searchtext=";
            loadTable(1,cmbPageSize.value,query);
        }


        //fill data into table - finish
        function loadTable(page,size,query) {
            page = page - 1;
            eventdetails = new Array();
          var data = httpRequest("/eventdetail/findAll?page="+page+"&size="+size+query,"GET");
            if(data.content!= undefined) eventdetails = data.content;           //data thiyanawada balala data load karanwa
            createPagination('pagination',data.totalPages, data.number+1,paginate);

            fillTable('tblEvent',eventdetails,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblEvent);

            if(activerowno!="")selectRow(tblEvent,activerowno,active);

        }

        //******************
        function paginate(page) {
            var paginate;
            if(oldemployee==null){
                paginate=true;
            }else{
                if(getErrors()==''&&getUpdates()==''){
                    paginate=true;
                }else{
                    paginate = window.confirm("Form has Some Errors or Update Values. " +
                        "Are you sure to discard that changes ?");
                }
            }
            if(paginate) {
                activepage=page;
                activerowno=""
                loadForm();
                loadSearchedTable();
            }

        }

        //print
        function viewitem(evntd,rowno) {

            eventdetail = JSON.parse(JSON.stringify(evntd));

            tdtxtEcode.innerHTML = eventdetail.eventcode;
            tdEtype.innerHTML = eventdetail.eventtype_id.name;
            tdtxtEName.innerHTML = eventdetail.name;
            tdDescription.innerHTML = eventdetail.description;
            tdEStatus.innerHTML = eventdetail.eventstatus_id.name;
            tdAddedDate.innerHTML = eventdetail.addeddate;
            tdAddedBy.innerHTML = eventdetail.employee_id.callingname;

            $('#eventVieweModal').modal('show'); //show model

         }

//row print
         function btnPrintRowMC(){
             var format = printformtable.outerHTML;

             var newwindow=window.open();
             newwindow.document.write("<html>" +
                 "<head><style type='text/css'>.google-visualization-table-th {text-align: left;}</style></head>" +
                 "<link rel='stylesheet' href='resources/bootstrap/css/bootstrap.min.css'>" +
                 "<body><div style='margin-top: 100px text-align: center; font-size:10px;'><h1>Event Details :</h1></div>" +
                 "<div>"+format+"</div>" +
                 "<script>printformtable.removeAttribute('style')</script>" +
                 "</body></html>");
             setTimeout(function () {newwindow.print();},100);
         }

        function loadForm() {
            eventdetail = new Object();
            oldeventdetail = null;     //form eka load wenakota old object ekak nathi nisa old object = null

            //fill data in to combo box
            fillCombo(cmbEtype,"Event type",eventtypes,"name","");

            //fill and auto select , auto bind
            fillCombo(cmbEStatus,"",eventstastusts,"name","Active");
            fillCombo(cmbAddedBy,"",employees,"callingname",session.getObject('activeuser').employeeId.callingname);

            //convert to string
            eventdetail.eventstatus_id=JSON.parse(cmbEStatus.value);
            cmbEStatus.disabled = true;

            eventdetail.employee_id=JSON.parse(cmbAddedBy.value);
            cmbAddedBy.disabled = true;

             var today = new Date();            //create date object
             var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
             if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
             var date = today.getDate();        // 1 to 31 range
             if(date<10) date = "0"+date;

            dteAddedDate.value=today.getFullYear()+"-"+month+"-"+date;
            eventdetail.addeddate=dteAddedDate.value;
            dteAddedDate.disabled = true;

            // Get Next Number Form Data Base
            var nextNumber = httpRequest("/eventdetail/nextnumber", "GET");
            txtEcode.value = nextNumber.eventcode;
            eventdetail.eventcode = txtEcode.value;

            //load wenakota text field empty
            txtEName.value = "";
            txtEName.value = "";
            txtEDescription.value = "";

            //auto load disable ewata valid color enawa
            setStyle(initial);
            txtEcode.style.border=valid;
            dteAddedDate.style.border=valid;
            cmbEStatus.style.border=valid;
            cmbAddedBy.style.border=valid;

             disableButtons(false, true, true);
        }

        function setStyle(style) {

            txtEcode.style.border = style;
            txtEName.style.border = style;
            txtEDescription.style.border = style;
            dteAddedDate.style.border = style;

            cmbEtype.style.border = style;
            cmbEStatus.style.border = style;
            cmbAddedBy.style.border = style;

        }

        function disableButtons(add, upd, del) {

            if (add || !privilages.add) {
                btnAdd.setAttribute("disabled", "disabled");
                $('#btnAdd').css('cursor','not-allowed');
            }
            else {
                btnAdd.removeAttribute("disabled");
                $('#btnAdd').css('cursor','pointer')
            }

            if (upd || !privilages.update) {
                btnUpdate.setAttribute("disabled", "disabled");
                $('#btnUpdate').css('cursor','not-allowed');
            }
            else {
                btnUpdate.removeAttribute("disabled");
                $('#btnUpdate').css('cursor','pointer');
             }

            if (!privilages.update) {
                $(".buttonup").prop('disabled', true);
                $(".buttonup").css('cursor','not-allowed');
            }
            else {
                $(".buttonup").removeAttr("disabled");
                $(".buttonup").css('cursor','pointer');
            }

            if (!privilages.delete){
                $(".buttondel").prop('disabled', true);
                $(".buttondel").css('cursor','not-allowed');
            }
            else {
                $(".buttondel").removeAttr("disabled");
                $(".buttondel").css('cursor','pointer');
            }

            // select deleted data row
            for(index in eventdetails){
                if(eventdetails[index].eventstatus_id.name =="Deleted"){
                    tblEvent.children[1].children[index].style.color = "#f00";
                    tblEvent.children[1].children[index].style.border = "2px solid red";
                    tblEvent.children[1].children[index].lastChild.children[1].disabled = true;
                    tblEvent.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";

                }
            }

            // select deactivated data row
            for(index in eventdetails){
                if(eventdetails[index].eventstatus_id.name =="Deactive"){
                 //   tblEvent.children[1].children[index].style.color = "#ff0";
                    tblEvent.children[1].children[index].style.border = "2px solid orange";
                  //  tblEvent.children[1].children[index].lastChild.children[1].disabled = true;
                 //   tblEvent.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";
                }
            }

        }

        function getErrors() {

            var errors = "";
            addvalue = "";

            if (eventdetail.eventcode == null)
                errors = errors + "\n" + "Event Code is Not Entered";
            else  addvalue = 1;

            if (eventdetail.name == null)
                errors = errors + "\n" + "Event Name is Not Entered";
            else  addvalue = 1;

            if (eventdetail.eventtype_id == null)
                errors = errors + "\n" + "Event Type Entered";
            else  addvalue = 1;

            return errors;

        }

        function btnAddMC(){

            if(getErrors()==""){
                if(txtEDescription.value == "" ){
                    swal({
                        title: "Are you sure to continue?",
                        text: "Form has some empty fields.",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                    }).then((willDelete) => {
                        if (willDelete) {
                            savedata();
                        }
                    });

                }else{
                    savedata();
                }
            }else{
                swal({
                    title: "You have following errors",
                    text: "\n"+getErrors(),
                    icon: "error",
                    button: true,
                });
            }
        }

//stop diplicating event - isn' link anywhere
    /*    function duplicateEvent(){
            if (oldeventdetail != null && oldeventdetail.name != eventdetail.name){
                field.style.border=valid;
            } else {
                swal({
                    title: "Event is Alredy Exist!",
                    text: "\n\n",
                    icon: "warning", button: false,
                    timer: 1500,
                });
            }
        }*/

        function savedata() {

//stop diplicating event
            var exteventdetail = httpRequest("/eventdetail/byeventname?name="+txtEName.value,"GET");
            if(exteventdetail!="") {
                txtEName.style.border = invalid;
                eventdetail.name = null;
                swal({
                    title: "Event Name is Alredy Exist!",
                    text: "\n\n",
                    icon: "warning", button: false,
                    timer: 1500,
                });

            }else{

            swal({
                title: "Are you sure to add following guardian?" ,
                text :
                    "\n Event Coode : " + eventdetail.eventcode +
                    "\n Event Name : " + eventdetail.name +
                    "\n Event Type : " + eventdetail.eventtype_id.name +
                    "\n Event Status : " + eventdetail.eventstatus_id.name,
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    var response = httpRequest("/eventdetail", "POST", eventdetail);
                    if (response == "0") {
                        swal({
                            position: 'center',
                            icon: 'success',
                            title: 'Your work has been Done \n Save SuccessFully!',
                            text: '\n',
                            button: false,
                            timer: 1200
                        });
                        activepage = 1;
                        activerowno = 1;        // add une palaweni row eka
                        loadSearchedTable();
                        loadForm();
                        changeTab('table');
                    }
                    else swal({
                        title: 'Save not Success... , You have following errors', icon: "error",
                        text: '\n ' + response,
                        button: true
                    });
                }
            });
            }
        }

        function btnClearMC() {
            //Get Cofirmation from the User window.confirm();
            checkerr = getErrors();

            if(oldeventdetail == null && addvalue == ""){
                loadForm();
            }else{
                swal({
                    title: "Form has some values. Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        loadForm();
                    }

                });
            }

        }

        function fillForm(evntd,rowno){
            activerowno = rowno;

            if (oldeventdetail==null) {        //edit karanna kalin object eka
                filldata(evntd);
            } else {
                swal({
                    title: "Form has some values. Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        filldata(evntd);
                    }

                });
            }

        }

        //when updating refill data into form --finish
        function filldata(evntd) {
            clearSelection(tblEvent);    //thiyana selected row ain wela aluth eka replace wenawa
            selectRow(tblEvent,activerowno,active);

            //json string ekakata covert karala java script objectect ekak karanawa
            eventdetail = JSON.parse(JSON.stringify(evntd));
            oldeventdetail = JSON.parse(JSON.stringify(evntd));

            txtEcode.value = eventdetail.eventcode;
            txtEName.value = eventdetail.name;
            txtEDescription.value = eventdetail.description;
            dteAddedDate.value = eventdetail.addeddate;
            cmbEtype.value = eventdetail.eventtype_id;
            cmbEStatus.value = eventdetail.eventstatus_id;

            //fill combo predefine functtion ekak
            //fill data in to combo box
            fillCombo(cmbEtype,"Select Event Type",eventtypes,"name",eventdetail.eventtype_id.name);

            //fill and auto select , auto bind
            fillCombo(cmbEStatus,"",eventstastusts,"name",eventdetail.eventstatus_id.name);
            cmbEStatus.disabled = false;             //update ekedith disable
            fillCombo(cmbAddedBy,"",employees,"callingname",eventdetail.employee_id.callingname);


            disableButtons(true, false, false);
            setStyle(valid);
           // changeTab('form');

            //optional fields walata color eka set karanawa
            if(eventdetail.description == null) txtEDescription.style.border = initial;

        }

        //chande una ewa catch karanwa - finish
        function getUpdates() {

            var updates = "";

            if(eventdetail!=null && oldeventdetail!=null) {

                if (eventdetail.eventcode != oldeventdetail.eventcode)
                    updates = updates + "\nEvent Code is Changed " + eventdetail.eventcode + " into " + oldeventdetail.eventcode;

                if (eventdetail.name != oldeventdetail.name)
                    updates = updates + "\nEvent name is Changed " + eventdetail.name + " into " + oldeventdetail.name;

                if (eventdetail.description != oldeventdetail.description)
                    updates = updates + "\nDescription is Changed " + eventdetail.description + " into " + oldeventdetail.description;

                if (eventdetail.eventtype_id.name != oldeventdetail.eventtype_id.name)
                    updates = updates + "\nEvent type is Changed " + eventdetail.eventtype_id.name + " into " + eventdetail.eventtype_id.name;

                if (eventdetail.eventstatus_id.name != oldeventdetail.eventstatus_id.name)
                    updates = updates + "\nEvent status is Changed " + eventdetail.eventstatus_id.name + " into " + eventdetail.eventstatus_id.name;

            }

            return updates;

        }

        function btnUpdateMC() {
            var errors = getErrors();       // update check karanna kalin errors check karanna oni nisa
            if (errors == "") {
                var updates = getUpdates();
                if (updates == "")
                    swal({
                    title: 'Nothing Updated..!',icon: "warning",
                    text: '\n',
                    button: false,
                    timer: 1200});
                else {
                    swal({
                        title: "Are you sure to update following duardian details?",
                        text: "\n"+ getUpdates(),
                        icon: "warning", buttons: true, dangerMode: true,
                    })
                        .then((willDelete) => {
                        if (willDelete) {
                            var response = httpRequest("/eventdetail", "PUT", eventdetail);
                            if (response == "0") {
                                swal({
                                    position: 'center',
                                    icon: 'success',
                                    title: 'Your work has been Done \n Update SuccessFully..!',
                                    text: '\n',
                                    button: false,
                                    timer: 1200
                                });
                                loadSearchedTable();
                                loadForm();
                               // changeTab('table');

                            }
                            else
                                swal({
                                    title: 'Failed to Update!',icon: "error",
                                    text: 'You have following errors..\n '+response,
                                    button: true});
                        }
                        });
                }
            }
            else
                swal({
                    title: 'You have following errors in your form',icon: "error",
                    text: '\n '+getErrors(),
                    button: true});

        }

        function btnDeleteMC(evntd) {
            eventdetail = JSON.parse(JSON.stringify(evntd));     //json string ekak karala object ekakta convert karanwa

            swal({
                title: "Are you sure to delete following Event?",
                text:
                    "\n Event name : " + eventdetail.name +
                    "\n Event code : " + eventdetail.eventcode,
                icon: "warning", buttons: true, dangerMode: true,
            }).then((willDelete)=> {
                if (willDelete) {
                    var responce = httpRequest("/eventdetail","DELETE",eventdetail);
                    if (responce==0) {
                        swal({
                            title: "Deleted Successfully....!",
                            text: "\n\n  Status change to delete",
                            icon: "success", button: false, timer: 1200,
                        });
                        loadSearchedTable();
                        loadForm();
                    } else {
                        swal({
                            title: "You have following erros....!",
                            text: "\n\n" + responce,
                            icon: "error", button: true,
                        });
                    }
                }
            });

       }

        function loadSearchedTable() {
            var searchtext = txtSearchName.value;
            var query ="&searchtext=";
            if(searchtext!="")
                query = "&searchtext=" + searchtext;
            //window.alert(query);

            loadTable(activepage, cmbPageSize.value, query);        // for load table

            //disable delete button when searching
            disableButtons(false, true, true);

        }

        function btnSearchMC(){
            activepage=1;
            loadSearchedTable();
        }

        //*************
        function btnSearchClearMC(){
               loadView();
        }

        //table print - finish
       function btnPrintTableMC() {

           var newwindow=window.open();
           formattab = tblEvent.outerHTML;

           newwindow.document.write("" +
               "<html>" +
               "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
               "<link rel='stylesheet' href='../resources/bootstrap/css/bootstrap.min.css'/></head>" +
               "<body><div style='margin-top: 150px; '> <h1> Event Details </h1></div>" +
               "<div>"+ formattab+"</div>"+
               "</body>" +
               "</html>");
           setTimeout(function () {newwindow.print();
              // newwindow.close();
               },100) ;
        }

        //*************
        function sortTable(cind) {
            cindex = cind;

         var cprop = tblEmployee.firstChild.firstChild.children[cindex].getAttribute('property');

           if(cprop.indexOf('.') == -1) {
               employees.sort(
                   function (a, b) {
                       if (a[cprop] < b[cprop]) {
                           return -1;
                       } else if (a[cprop] > b[cprop]) {
                           return 1;
                       } else {
                           return 0;
                       }
                   }
               );
           }else {
               employees.sort(
                   function (a, b) {
                       if (a[cprop.substring(0,cprop.indexOf('.'))][cprop.substr(cprop.indexOf('.')+1)] < b[cprop.substring(0,cprop.indexOf('.'))][cprop.substr(cprop.indexOf('.')+1)]) {
                           return -1;
                       } else if (a[cprop.substring(0,cprop.indexOf('.'))][cprop.substr(cprop.indexOf('.')+1)] > b[cprop.substring(0,cprop.indexOf('.'))][cprop.substr(cprop.indexOf('.')+1)]) {
                           return 1;
                       } else {
                           return 0;
                       }
                   }
               );
           }
            fillTable('tblEmployee',employees,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblEmployee);
            loadForm();

            if(activerowno!="")selectRow(tblEmployee,activerowno,active);



        }