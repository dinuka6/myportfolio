
        window.addEventListener("load", initialize);

//Initializing Functions
        function initialize() {

            $('[data-toggle="tooltip"]').tooltip();     //tool tip unable
            $('.js-example-basic-single').select2();

            btnAdd.addEventListener("click",btnAddMC);      //button walata event handler bind karala
            btnClear.addEventListener("click",btnClearMC);
         //   btnUpdate.addEventListener("click",btnUpdateMC);

            txtSearchName.addEventListener("keyup",btnSearchMC);

            //calculate paid amount
       //     txtPaidAmount.addEventListener("keyup",txtPaidAmountKU);

            privilages = httpRequest("../privilage?module=STUDENTPAYMENT","GET");

            //drop down ena than walata data genna gananna
            students = httpRequest("../student/list","GET");
            classrooms = httpRequest("../classroom/list","GET");
            paymentstatusts = httpRequest("../studentpaymentstatus/list","GET");
            employees = httpRequest("../employee/list","GET");
            sturegistration = httpRequest("../studentregistration/list","GET");

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

//fill data into table
        function loadTable(page,size,query) {
            page = page - 1;
            studentpayments = new Array();
          var data = httpRequest("/studentpayment/findAll?page="+page+"&size="+size+query,"GET");
            if(data.content!= undefined) studentpayments = data.content;             //data thiyanawada balala data load karanwa
            createPagination('pagination',data.totalPages, data.number+1,paginate);
            fillTable('tblstudentpayment',studentpayments,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblstudentpayment);
            if(activerowno!="")selectRow(tblstudentpayment,activerowno,active);

        }

        //******************
        function paginate(page) {
            var paginate;
            if(oldstupayment==null){
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
        function viewitem(stupay,rowno) {

            studentpayment = JSON.parse(JSON.stringify(stupay));

            tdStudentId.innerHTML = studentpayment.student_id.cname;
            tdClassroom.innerHTML = studentpayment.studentregistration_id.classroom_id.name;
            tdBillNumber.innerHTML = studentpayment.billno;
            tdTotalFees.innerHTML = studentpayment.totalfee;
            tdPaidAmount.innerHTML = studentpayment.paidamount;
            tdDescription.innerHTML = studentpayment.description;
            tdAddedBy.innerHTML = studentpayment.employee_id.callingname;
            tdStudentPayStatus.innerHTML = studentpayment.studentpaymentstatus_id.name;
            tddtePaid.innerHTML = studentpayment.paiddate;

            $('#StudentPaymentVieweModal').modal('show'); //show model

         }

         //row print
         function btnPrintRowMC(){
             var format = printformtable.outerHTML;

             var newwindow=window.open();
             newwindow.document.write("<html>" +
                 "<head><style type='text/css'>.google-visualization-table-th {text-align: left;}</style></head>" +
                 "<link rel='stylesheet' href='resources/bootstrap/css/bootstrap.min.css'>" +
                 "<body><div style='margin-top: 100px text-align: center; font-size:10px;'><h1>Student Payment Details :</h1></div>" +
                 "<div>"+format+"</div>" +
                 "<script>printformtable.removeAttribute('style')</script>" +
                 "</body></html>");
             setTimeout(function () {newwindow.print(); },100);
         }

        function cmbRegStudentCH(){
            sturegistrationbystudent = httpRequest("../studentregistration/srbystudent?studentid="+JSON.parse(cmbStudentId.value).id,"GET");

            txtTotalFees.value = parseFloat(sturegistrationbystudent.totalfee).toFixed(2);
            txtTotalFees.style.border = valid;
            stupayment.totalfee = txtTotalFees.value;

        }



//classroom list according to student
        function cmbStudentCH(){
            studentbyclassroom = httpRequest("../studentregistration/listbystudent?studentid="+JSON.parse(cmbStudentId.value).id,"GET");
            fillCombo(cmbClassroom,"Select Classroom Name",studentbyclassroom,"classroom_id.name","");

            if(studentbyclassroom != null){
                cmbClassroom.disabled = false;
            }else {
                cmbClassroom.disabled = true;
            }

        }

        function cmbClassroomCH(){
            totalfeebystubyclassr = JSON.parse(cmbClassroom.value);

            txtDescription.value = totalfeebystubyclassr.description;
            txtDescription.style.border = valid;
            stupayment.description = txtDescription.value;

            txtTotalFees.value = parseFloat(totalfeebystubyclassr.totalfee).toFixed(2);
            txtTotalFees.style.border = valid;
            stupayment.totalfee = txtTotalFees.value;

            txtPaidAmount.value = parseFloat(totalfeebystubyclassr.totalfee).toFixed(2);
            txtPaidAmount.style.border = valid;
            stupayment.paidamount = txtPaidAmount.value;

        }

       /* function txtPaidAmountKU(){
            txtBalance.value = parseFloat(txtTotalFees.value) - parseFloat(txtPaidAmount.value);
            txtBalance.style.border = valid;
            stupayment.balanceamount = txtBalance.value;
        }*/



        function loadForm() {
            stupayment = new Object();
            oldstupayment = null;     //form eka load wenakota old object ekak nathi nisa old object = null

            //fill data in to combo box
            fillCombo3(cmbStudentId,"Select Student",students,"regno","cname","");
            fillCombo(cmbClassroom,"Select Classroom Name",classrooms,"name", "");

            //fill and auto select , auto bind
            fillCombo(cmbStudentPayStatus,"",paymentstatusts,"name","Active");
            fillCombo(cmbAddedBy,"",employees,"callingname",session.getObject('activeuser').employeeId.callingname);

            //convert to string
            stupayment.studentpaymentstatus_id=JSON.parse(cmbStudentPayStatus.value);
            cmbStudentPayStatus.disabled = true;

            stupayment.employee_id=JSON.parse(cmbAddedBy.value);
            cmbAddedBy.disabled = true;

             var today = new Date();            //create date object
             var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
             if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
             var date = today.getDate();        // 1 to 31 range
             if(date<10) date = "0"+date;

            dtePaid.value=today.getFullYear()+"-"+month+"-"+date;
            stupayment.paiddate=dtePaid.value;
            dtePaid.disabled = true;

            //load and disable
            cmbClassroom.disabled = true;

            // Get Next Number Form Data Base
            var nextNumber = httpRequest("/studentpayment/nextnumber", "GET");
            txtBillNumber.value = nextNumber.billno;
            stupayment.billno = txtBillNumber.value;
            txtBillNumber.disabled="disabled";

            //load wenakota text field empty
            txtDescription.value = "";
            txtTotalFees.value = "";
            txtPaidAmount.value = "";
      //      txtBalance.value = "";

            //auto load disable ewata valid color enawa
            setStyle(initial);
            txtBillNumber.style.border = valid;
            dtePaid.style.border=valid;
            cmbStudentPayStatus.style.border=valid;
            cmbAddedBy.style.border=valid;

             disableButtons(false, true, true);
        }

        function setStyle(style) {


            txtTotalFees.style.border = style;
            txtPaidAmount.style.border = style;
         //   txtBalance.style.border = style;
            txtDescription.style.border = style;

            cmbStudentId.style.border = style;
            cmbClassroom.style.border = style;
            dtePaid.style.border = style;

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

          /*  if (upd || !privilages.update) {
                btnUpdate.setAttribute("disabled", "disabled");
                $('#btnUpdate').css('cursor','not-allowed');
            }
            else {
                btnUpdate.removeAttribute("disabled");
                $('#btnUpdate').css('cursor','pointer');
             }
*/
   /*         if (!privilages.update) {
                $(".buttonup").prop('disabled', true);
                $(".buttonup").css('cursor','not-allowed');
            }
            else {
                $(".buttonup").removeAttr("disabled");
                $(".buttonup").css('cursor','pointer');
            }

*/
  /*          if (!privilages.delete){
                $(".buttondel").prop('disabled', true);
                $(".buttondel").css('cursor','not-allowed');
            }
            else {
                $(".buttondel").removeAttr("disabled");
                $(".buttondel").css('cursor','pointer');
            }*/

            // select deleted data row
            for(index in studentpayments){
                tblstudentpayment.children[1].children[index].lastChild.children[0].style.display = "none";
                tblstudentpayment.children[1].children[index].lastChild.children[1].style.display = "none";


             /*   if(studentpayments[index].studentpaymentstatus_id.name =="Deleted"){
                    tblstudentpayment.children[1].children[index].style.color = "#f00";
                    tblstudentpayment.children[1].children[index].style.color = "#f00";
                    tblstudentpayment.children[1].children[index].style.border = "2px solid red";
                    tblstudentpayment.children[1].children[index].lastChild.children[1].disabled = true;
                    tblstudentpayment.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";


                } */
            } $('.modifybutton').removeAttr('style');

        }

        function getErrors() {

            var errors = "";
            addvalue = "";

            if (stupayment.student_id == null)
                errors = errors + "\n" + "Student is Not Selected";
            else  addvalue = 1;

            if (stupayment.studentregistration_id == null)
                errors = errors + "\n" + "Classroom is Not Selected";
            else  addvalue = 1;

            if (stupayment.paidamount == "")
                errors = errors + "\n" + "Paid Amount is Not Entered";
            else  addvalue = 1;

            return errors;

        }

        function btnAddMC(){
            if(getErrors()==""){
                if(txtDescription.value == "" ){
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

        function savedata() {

            swal({
                title: "Are you sure to add following classroom?" ,
                text :
                    "\nStudent Name: " + stupayment.student_id.cname +
//special                    "\nClassroom : " + stupayment.studentregistration_id.classroom_id.name +
                    "\nTotal Fees : " + stupayment.totalfee +
                    "\nPaid Amount : " + stupayment.paidamount,
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
//special
                    var response = httpRequest("/studentpayment", "POST", stupayment);
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
                        viewitem(stupayment);
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

            if(oldstupayment == null && addvalue == ""){
                loadForm();
            }else{
                swal({
                    title: "Form has some values, updates values... Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        loadForm();
                    }

                });
            }

        }

        function fillForm(stupay,rowno){
            activerowno = rowno;

            if (oldstupayment==null) {        //edit karanna kalin object eka
                filldata(stupay);
            } else {
                swal({
                    title: "Form has some values. Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        filldata(stupay);
                    }

                });
            }

        }

        //when updating refill data into form
        function filldata(stupay) {
            clearSelection(tblstudentpayment);    //thiyana selected row ain wela aluth eka replace wenawa
            selectRow(tblstudentpayment,activerowno,active);

            //json string ekakata covert karala java script objectect ekak karanawa
            stupayment = JSON.parse(JSON.stringify(stupay));
            oldstupayment = JSON.parse(JSON.stringify(stupay));

            txtBillNumber.value = stupayment.billno;
            txtTotalFees.value = stupayment.totalfee;
            txtPaidAmount.value = stupayment.paidamount;
            txtBalance.value = stupayment.balanceamount;
            txtDescription.value = stupayment.description;
            dtePaid.value = stupayment.paiddate;

            //fill combo predefine functtion ekak
            //fill data in to combo box
            fillCombo3(cmbStudentId,"",students,"regno","cname","");
            fillCombo(cmbClassroom,"",classrooms,"name", "");
            cmbClassroom.disabled = true;

            //fill and auto select , auto bind
            fillCombo(cmbStudentPayStatus,"",paymentstatusts,"name",stupayment.studentpaymentstatus_id.name);
            cmbStudentPayStatus.disabled = false;             //update ekedith disable
            fillCombo(cmbAddedBy,"",employees,"callingname",stupayment.employee_id.callingname);


            disableButtons(true, false, false);
            setStyle(valid);
            changeTab('form');

            //optional fields walata color eka set karanawa
            if(stupayment.description == null) txtDescription.style.border = initial;
        }

        //chande una ewa catch karanwa
        function getUpdates() {

            var updates = "";

            if(stupayment!=null && oldstupayment!=null) {

                if (stupayment.student_id.cname != oldstupayment.student_id.cname)
                    updates = updates + "\nStudent is Changed " + stupayment.student_id.cname + " into " + oldstupayment.student_id.cname;

                if (stupayment.studentregistration_id.classroom_id.name != oldstupayment.studentregistration_id.classroom_id.name)
                    updates = updates + "\nClassroom is Changed " + stupayment.studentregistration_id.classroom_id.name + " into " + oldstupayment.studentregistration_id.classroom_id.name;

                if (stupayment.paidamount != oldstupayment.paidamount)
                    updates = updates + "\nPaid amount is Changed " + stupayment.paidamount + " into " + oldstupayment.paidamount;

                if (stupayment.studentpaymentstatus_id.name != oldstupayment.studentpaymentstatus_id.name)
                    updates = updates + "\nPayment Status is Changed " + stupayment.studentpaymentstatus_id.name + " into " + oldstupayment.studentpaymentstatus_id.name;

            }

            return updates;

        }

        function btnUpdateMC() {
            var errors = getErrors();       // update check karanna kalin errors check karanna oni nisa
            if (errors == "") {
                var updates = getUpdates();
                if (updates == "")
                    swal({
                    title: 'Nothing Updated!',icon: "warning",
                    text: '\n',
                    button: false,
                    timer: 1200});
                else {
                    swal({
                        title: "Are you sure to update following payment details?",
                        text: "\n"+ getUpdates(),
                        icon: "warning", buttons: true, dangerMode: true,
                    })
                        .then((willDelete) => {
                        if (willDelete) {
                            var response = httpRequest("/studentpayment", "PUT", stupayment);
                            if (response == "0") {
                                swal({
                                    position: 'center',
                                    icon: 'success',
                                    title: 'Your work has been Done \n Update SuccessFully!',
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

        function btnDeleteMC(stupay) {
            stupayment = JSON.parse(JSON.stringify(stupay));     //json string ekak karala object ekakta convert karanwa

            swal({
                title: "Are you sure to delete following payment details?",
                text:
                    "\n Student Name: " + stupayment.student_id.cname +
                    "\nClassroom : " + stupayment.studentregistration_id.classroom_id.name +
                    "\n Total Fees : " + stupayment.totalfee +
                    "\n Paid Amount : " + stupayment.paidamount +
                    "\n Balance : " + stupayment.balanceamount,
                icon: "warning", buttons: true, dangerMode: true,
            }).then((willDelete)=> {
                if (willDelete) {
                    var responce = httpRequest("/studentpayment","DELETE",stupayment);
                    if (responce==0) {
                        swal({
                            title: "Deleted Successfully!",
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

        //table print
       function btnPrintTableMC() {

           var newwindow=window.open();
           formattab = tblstudentpayment.outerHTML;

           newwindow.document.write("" +
               "<html>" +
               "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
               "<link rel='stylesheet' href='../resources/bootstrap/css/bootstrap.min.css'/></head>" +
               "<body><div style='margin-top: 150px; '> <h1> Student Payment Details </h1></div>" +
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