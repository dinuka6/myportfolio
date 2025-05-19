
        window.addEventListener("load", initialize);

        //Initializing Function
        function initialize() {

            $('[data-toggle="tooltip"]').tooltip();     //tool tip unable

            btnAdd.addEventListener("click",btnAddMC);      //button walata event handler bind karala
            btnClear.addEventListener("click",btnClearMC);
            btnUpdate.addEventListener("click",btnUpdateMC);

   //         txtSearchNameInner.addEventListener("keyup",btnInnerSearchMC);

            txtSearchName.addEventListener("keyup",btnSearchMC);
            txtSocietyFees.addEventListener("keyup",txtTotalFeesKU);

            privilages = httpRequest("../privilage?module=ACADAMICYEAR","GET");

            //drop down ena than walata data genna gananna
            yearstatusts = httpRequest("../acadamicystatus/list","GET");
            employees = httpRequest("../employee/list","GET");

            //inner list
            eventsetails = httpRequest("../eventdetail/list","GET");

            valid = "2px solid green";
            invalid = "2px solid red";
            initial = "2px solid #38040EFF";
            updated = "2px solid #ffcf56";
            active = "#538d22";

            //load view side
            loadView();

            //refresh form
           loadForm();


            changeTab('form');
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
            acadamicyears = new Array();
          var data = httpRequest("/acadamicyear/findAll?page="+page+"&size="+size+query,"GET");
            if(data.content!= undefined) acadamicyears = data.content;                              //data thiyanawada balala data load karanwa
            createPagination('pagination',data.totalPages, data.number+1,paginate);

            fillTable('tblYear',acadamicyears,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblYear);

            if(activerowno!="")selectRow(tblYear,activerowno,active);

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
        function viewitem(yer,rowno) {

            acayear = JSON.parse(JSON.stringify(yer));

            tdYearName.innerHTML = acayear.name;
            tdStartDate.innerHTML = acayear.startdate;
            tdEndDate.innerHTML = acayear.enddate;
            tdAcadamicFees.innerHTML = acayear.acadamicfee;
            tdSocietyFees.innerHTML = acayear.societyfee;
            tdStudentFees.innerHTML = acayear.studentfee;
            tdDescription.innerHTML = acayear.description;
            tdYearstatus.innerHTML = acayear.yearstatus_id.name;
            tdAddedDate.innerHTML = acayear.addeddate;

            fillInnerTable("tblPrintInnerYear" , acayear.acadamicyearHasEventdetailList, innerModify, innerDelete, innerView);

            $('#accadamicyearVieweModal').modal('show'); //show model

         }

         //row print
         function btnPrintRowMC(){
             var format = printformtable.outerHTML;

             var newwindow=window.open();
             newwindow.document.write("<html>" +
                 "<head><style type='text/css'>.google-visualization-table-th {text-align: left;}</style></head>" +
                 "<link rel='stylesheet' href='resources/bootstrap/css/bootstrap.min.css'>" +
                 "<body><div style='margin-top: 150px'><h1>Acadamic Year Details :</h1></div>" +
                 "<div>"+format+"</div>" +
                 "<script>printformtable.removeAttribute('style')</script>" +
                 "</body></html>");
             setTimeout(function () {newwindow.print(); newwindow.close();},100);
         }

         function txtTotalFeesKU(){
             txtStudentFees.value = parseFloat(txtAcadamicFees.value) + parseFloat(txtSocietyFees.value);
             txtStudentFees.style.border = valid;
             acayear.studentfee = txtStudentFees.value;

         }

        function loadForm() {
            acayear = new Object();
            oldacayear = null;     //form eka load wenakota old object ekak nathi nisa old object = null

            //many to many insert
            acayear.acadamicyearHasEventdetailList = new Array();


            //fill and auto select , auto bind
            fillCombo(cmbYearstatus,"",yearstatusts,"name","Active");
            fillCombo(cmbAddedBy,"",employees,"callingname",session.getObject('activeuser').employeeId.callingname);

            //convert to string
            acayear.yearstatus_id=JSON.parse(cmbYearstatus.value);
            cmbYearstatus.disabled = true;

            acayear.employee_id=JSON.parse(cmbAddedBy.value);
            cmbAddedBy.disabled = true;

             var today = new Date();            //create date object
             var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
             if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
             var date = today.getDate();        // 1 to 31 range
             if(date<10) date = "0"+date;

            dteAddedDate.value=today.getFullYear()+"-"+month+"-"+date;
            acayear.addeddate=dteAddedDate.value;
            dteAddedDate.disabled = true;

            dteStartDate.min = getCurrentDateTime('date');
            dteEndDate.min = getCurrentDateTime('date');
            let afteroneyear = new Date();
            afteroneyear.setDate(today.getDate()+ 380);
            dteStartDate.max = afteroneyear.getFullYear()+"-"+getmonthdate(afteroneyear);
            dteEndDate.max = afteroneyear.getFullYear()+"-"+getmonthdate(afteroneyear);

            // Get Next Number Form Data Base
            var nextNumber = httpRequest("/acadamicyear/nextnumber", "GET");
            txtYearName.value = nextNumber.name;
            acayear.name = txtYearName.value;

            //load wenakota text field empty
            txtAcadamicFees.value = "";
            txtSocietyFees.value = "";
            txtStudentFees.value = "";
            txtDescription.value = "";
            dteStartDate.value = "";
            dteEndDate.value = "";

            //auto load disable ewata valid color enawa
            setStyle(initial);
            txtYearName.style.border=valid;
            cmbYearstatus.style.border=valid;
            dteAddedDate.style.border=valid;
            cmbAddedBy.style.border=valid;

             disableButtons(false, true, true);

            refreshInnerdForm();
        }

 //innerform - finish
        function refreshInnerdForm(){
            acadamicyearhaseventdetail = new Object();
            oldacadamicyearhaseventdetail = null;

            //auto fill inner combo
            fillCombo(txtEventName,"Select Event",eventsetails,"name","");
            txtEventName.style.border = initial;

            txtEventName.style.border = initial;
            dteEventStart.style.border = initial;
            dteEventEnd.style.border = initial;

            dteEventStart.value = "";
            dteEventEnd.value = "";

            var today = new Date();            //create date object
            var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
            if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
            var date = today.getDate();        // 1 to 31 range
            if(date<10) date = "0"+date;

            dteEventStart.min = getCurrentDateTime('date');
            dteEventEnd.min = getCurrentDateTime('date');
            let afteronemonth = new Date();
            afteronemonth.setDate(today.getDate()+60);
            dteEventStart.max = afteronemonth.getFullYear()+"-"+getmonthdate(afteronemonth);
            dteEventEnd.max = afteronemonth.getFullYear()+"-"+getmonthdate(afteronemonth);
            console.log( afteronemonth.getFullYear()+"-"+getmonthdate(afteronemonth))

            //inner table
            fillInnerTable("tblInnerEvent" , acayear.acadamicyearHasEventdetailList , innerModify, innerDelete, innerView);

            //inner edit eka disable
            if(acayear.acadamicyearHasEventdetailList.length != 0){
                for (var index in acayear.acadamicyearHasEventdetailList){
                    tblInnerEvent.children[1].children[index].lastChild.children[0].style.display = "none";
                }
            }
        }

  //inner add
        function btnInnerAddMC(){

            var eventnext = false;
            for (var index in acayear.acadamicyearHasEventdetailList){
                if (acayear.acadamicyearHasEventdetailList[index].eventdetail_id.name == acadamicyearhaseventdetail.eventdetail_id.name){
                    eventnext = true;
                    break;
                }
            }
            if (eventnext){
                swal({
                    title: 'Airedy exsist!',icon: "warning",
                    text: '\n',
                    button: false,
                    timer: 1200});
            }else {
                acayear.acadamicyearHasEventdetailList.push(acadamicyearhaseventdetail);
                refreshInnerdForm();
            }
        }

        function innerModify(){}

        function innerDelete(innerob,innerrow){

            swal({
                title: "Are you sure to remove following event ?",
                text: "\n" + "Event Name : " + innerob.eventdetail_id.name ,
                icon: "warning", buttons: true, dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    acayear.acadamicyearHasEventdetailList.splice(innerrow, 1);
                    refreshInnerdForm();
                }

            });

        }

        function innerView(){}

        function setStyle(style) {

            dteStartDate.style.border = style;
            dteEndDate.style.border = style;
            txtAcadamicFees.style.border = style;
            txtSocietyFees.style.border = style;
            txtStudentFees.style.border = style;
            txtDescription.style.border = style;

            cmbYearstatus.style.border = style;
            dteAddedDate.style.border = style;
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
            for(index in acadamicyears){
                if(acadamicyears[index].yearstatus_id.name =="Deleted"){
                    tblYear.children[1].children[index].style.color = "#f00";
                    tblYear.children[1].children[index].style.border = "2px solid red";
                    tblYear.children[1].children[index].lastChild.children[1].disabled = true;
                    tblYear.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";
                }
            }

            // select deactivated data row
            for(index in acadamicyears){
                if(acadamicyears[index].yearstatus_id.name =="Deactive"){
                    //   tblEvent.children[1].children[index].style.color = "#ff0";
                    tblYear.children[1].children[index].style.border = "2px solid orange";
                    //  tblEvent.children[1].children[index].lastChild.children[1].disabled = true;
                    //   tblEvent.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";

                }
            }

        }

        function dteStartCH() {
            var today = new Date();
            var startdate = new Date(dteStartDate.value);

            if(startdate.getDate() != null) {
                acayear.startdate = dteStartDate.value;
                dteStartDate.style.border = valid;
            } else {
                acayear.startdate = null;
                dteStartDate.style.border = invalid;
            }
/*
            if (oldacayear.startdate != JSON.parse(dteStartDate.value)){
                dteStartDate.style.border = updated;
            }else {
                dteStartDate.style.border = valid;
            }           */
        }

        function dteEndCH() {
            var enddate = new Date(dteEndDate.value);
            if(enddate.getDate() != null) {
                acayear.enddate = dteEndDate.value;
                dteEndDate.style.border = valid;
            } else {
                acayear.enddate = null;
                dteEndDate.style.border = invalid;
            }
        }

        function getErrors() {

            var errors = "";
            addvalue = "";

            if (acayear.name == null)
                errors = errors + "\n" + "Year Name is Not Entered";
            else  addvalue = 1;

            if (acayear.startdate == null)
                errors = errors + "\n" + "Start date is Not Entered";
            else  addvalue = 1;

            if (acayear.enddate == null)
                errors = errors + "\n" + "End Date is Not Entered";
            else  addvalue = 1;

            if (acayear.acadamicfee == null)
                errors = errors + "\n" + "Acadamic Fees is Not Entered";
            else  addvalue = 1;

            if (acayear.societyfee == null)
                errors = errors + "\n" + "Society Fees is Not Entered";
            else  addvalue = 1;

            if (acayear.acadamicyearHasEventdetailList.length  == 0){
                txtEventName.style.border = invalid;
                errors = errors + "\n" + "Event is Not Selected";
            }else  addvalue = 1;

            return errors;

        }

        function btnAddMC(){
            if(getErrors()==""){
                if(txtDescription.value == "" ){
                    swal({
                        title: "Are you sure to continue...?",
                        text: "Form has some empty fields.....",
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

        function savedata() {

            swal({
                title: "Are you sure to add Details?" ,
                text :
                    "\nYear : " + acayear.name +
                    "\nStart Date : " + acayear.startdate +
                    "\nEnd Date : " + acayear.enddate +
                    "\nAcadamic Fees : " + acayear.acadamicfee +
                    "\nSociety  Fees : " + acayear.societyfee +
                    "\nTotal Student Fees : " + acayear.studentfee +
                    "\nguardian Status : " + acayear.yearstatus_id.name,
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    var response = httpRequest("/acadamicyear", "POST", acayear);
                    if (response == "0") {
                        swal({
                            position: 'center',
                            icon: 'success',
                            title: 'Your work has been Done \n Save SuccessFully..!',
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

        function btnClearMC() {
            //Get Cofirmation from the User window.confirm();
            checkerr = getErrors();

            if(oldacayear == null && addvalue == ""){
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

        function fillForm(yer,rowno){
            activerowno = rowno;

            if (oldacayear==null) {        //edit karanna kalin object eka
                filldata(yer);
            } else {
                swal({
                    title: "Form has some values. Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        filldata(yer);
                    }

                });
            }

        }

        //when updating refill data into form
        function filldata(yer) {
            clearSelection(tblYear);    //thiyana selected row ain wela aluth eka replace wenawa
            selectRow(tblYear,activerowno,active);

            //json string ekakata covert karala java script objectect ekak karanawa
            acayear = JSON.parse(JSON.stringify(yer));
            oldacayear = JSON.parse(JSON.stringify(yer));

            //refill data into form
            txtYearName.value = acayear.name;
            dteStartDate.value = acayear.startdate;
            dteEndDate.value = acayear.enddate;
            txtAcadamicFees.value = acayear.acadamicfee;
            txtSocietyFees.value = acayear.societyfee;
            txtStudentFees.value = acayear.studentfee;
            txtDescription.value = acayear.description;
            dteAddedDate.value = acayear.addeddate;


            //fill combo predefine functtion ekak
            //fill data in to combo box
            //fill and auto select , auto bind
            fillCombo(cmbYearstatus,"",yearstatusts,"name",acayear.yearstatus_id.name);
            cmbYearstatus.disabled = false;             //update ekedith disable
            fillCombo(cmbAddedBy,"",employees,"callingname",acayear.employee_id.callingname);

            disableButtons(true, false, false);
            setStyle(valid);

            refreshInnerdForm();
            changeTab('form');

            //optional fields walata color eka set karanawa
            if(acayear.description == null)txtDescription.style.border = initial;

        }

        //chande una ewa catch karanwa
        function getUpdates() {

            var updates = "";

            if(acayear!=null && oldacayear!=null) {

                if (acayear.name != oldacayear.name)
                    updates = updates + "\nYear Name is Changed " + acayear.name + " into " + oldacayear.name;

                if (acayear.startdate != oldacayear.startdate)
                    updates = updates + "\nStart date is Changed " + acayear.startdate + " into " + oldacayear.startdate;

                if (acayear.enddate != oldacayear.enddate)
                    updates = updates + "\nEnd date Changed " + acayear.enddate + " into " + oldacayear.enddate;

                if (acayear.acadamicfee != oldacayear.acadamicfee)
                    updates = updates + "\nAcadamic Fees is Changed " + acayear.acadamicfee + " into " + oldacayear.acadamicfee;

                if (acayear.societyfee != oldacayear.societyfee)
                    updates = updates + "\nSociety Fees is Changed " + acayear.societyfee + " into " + oldacayear.societyfee;

                if (acayear.studentfee != oldacayear.studentfee)
                    updates = updates + "\nStudent Fees is Changed " + acayear.studentfee + " into " + oldacayear.studentfee;

                if (acayear.description != oldacayear.description)
                    updates = updates + "\nDescription is Changed " + acayear.description + " into " + oldacayear.description;

                if (acayear.yearstatus_id.name != oldacayear.yearstatus_id.name)
                    updates = updates + "\nYear Status is Changed " + acayear.yearstatus_id.name + " into " + oldacayear.yearstatus_id.name;

                if (isEqual(acayear.acadamicyearHasEventdetailList, oldacayear.acadamicyearHasEventdetailList, 'eventdetail_id'))
                    updates = updates + "\nEvent is Changed";

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
                            var response = httpRequest("/acadamicyear", "PUT", acayear);
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
                                changeTab('table');

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

        function btnDeleteMC(yer) {
            acadamicyear = JSON.parse(JSON.stringify(yer));     //json string ekak karala object ekakta convert karanwa

            swal({
                title: "Are you sure to delete following Year Details?",
                text:
                    "\n Year name : " + acadamicyear.name +
                    "\n Start date : " + acadamicyear.startdate +
                    "\n End date : " + acadamicyear.enddate,
                icon: "warning", buttons: true, dangerMode: true,
            }).then((willDelete)=> {
                if (willDelete) {
                    var responce = httpRequest("/acadamicyear","DELETE",acadamicyear);
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
                            title: "You have following erros!",
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

            //combo box value cmb
         //   query = "&searchtext=" + searchtext;

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
           formattab = tblYear.outerHTML;

           newwindow.document.write("" +
               "<html>" +
               "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
               "<link rel='stylesheet' href='../resources/bootstrap/css/bootstrap.min.css'/></head>" +
               "<body><div style='margin-top: 150px; '> <h1> Acadamic Year Details </h1></div>" +
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