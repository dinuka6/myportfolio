
        window.addEventListener("load", initialize);

        //Initializing Function
        function initialize() {

            document.getElementById("tblStuReport").style.display = "none";
            document.getElementById("tbTable").style.display = "none";

            $('[data-toggle="tooltip"]').tooltip();     //tool tip unable

            $('.js-example-basic-single').select2();       //type and search

      //      btnAdd.addEventListener("click",btnAddMC);      //button walata event handler bind karala
       //     btnClear.addEventListener("click",btnClearMC);
      //      btnUpdate.addEventListener("click",btnUpdateMC);

            txtSearchName.addEventListener("keyup",btnSearchMC);

            //clssroom ekata adala subject list eka
            cmbClassroom.addEventListener("change",cmbSubjectCH);

            //clssroom ekata adala subject list eka
          //  cmbClassroom.addEventListener("change",cmbSubjectCH);

//check
            privilages = httpRequest("../privilage?module=STUDENTREGISTRATION","GET");

            //drop down ena than walata data genna gananna
            regstudents = httpRequest("../listbyregstudent/list","GET");
            students = httpRequest("../student/list","GET");
       //     acadamicyears = httpRequest("../acadamicyear/list","GET");
        //    grades = httpRequest("../grade/list","GET");
            classrooms = httpRequest("../classroom/list","GET");
            statusts = httpRequest("../studentregstatus/list","GET");
            employees = httpRequest("../employee/list","GET");

            //inner list
            eventsetails = httpRequest("../subjectdetail/list","GET");

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
            studentreportcards = new Array();
          var data = httpRequest("/studentregistration/findAll?page="+page+"&size="+size+query,"GET");
            if(data.content!= undefined) studentreportcards = data.content;                              //data thiyanawada balala data load karanwa
            createPagination('pagination',data.totalPages, data.number+1,paginate);

            fillTable('tblStuReport',studentreportcards,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblStuReport);

            if(activerowno!="")selectRow(tblStuReport,activerowno,active);

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

//print - not finish
        function viewitem(sturep,rowno) {

            stureport = JSON.parse(JSON.stringify(sturep));

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

//row print -  not finish
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

 /*        function txtTotalFeesKU(){
             txtStudentFees.value = parseFloat(txtAcadamicFees.value) + parseFloat(txtSocietyFees.value);
             txtStudentFees.style.border = valid;
             acayear.studentfee = txtStudentFees.value;

         }*/


        function cmbSubjectCH(){

            //old object eka null wena awstawa =  inotial awastawa
            if(oldstureport == null){
                subjectbyclassroom = [];
                stureport.studentHasReportcardList = [];
                subjectbyclassroom = httpRequest("/studentregistration/listbyregstudent?studentid="+JSON.parse(cmbStudent.value).id+"&clasroomid="+JSON.parse(cmbClassroom.value).classroom_id.id,"GET");

            //length eka empty nettan if eka etule for loop eka run wenna oni
            if(subjectbyclassroom.studentHasReportcardList.length != 0){
                var tbody = tblInnerStuReportCard.children[1];             //body ekata data apend kirima, 1 = body eka / first child
                tbody.innerHTML = "";                                   //initialy html body eka empty
                for (var index in subjectbyclassroom.studentHasReportcardList){

                    //td = columns
                    var tr = document.createElement('tr');
                    var td1 = document.createElement('td');
                    var td2 = document.createElement('td');
                    var td3 = document.createElement('td');
                    var td4 = document.createElement('td');
                    var td5 = document.createElement('td');

                    td1.innerText = parseInt(index) + 1;
                    td2.innerText = subjectbyclassroom.studentHasReportcardList[index].subjectdetail_id.name;
                    td3.innerText = subjectbyclassroom.studentHasReportcardList[index].first_term_result;
                    td4.innerText = subjectbyclassroom.studentHasReportcardList[index].second_term_result;
                    td5.innerText = subjectbyclassroom.studentHasReportcardList[index].third_term_result;

                    //row ekata colums add karanawa
                    tr.appendChild(td1);
                    tr.appendChild(td2);
                    tr.appendChild(td3);
                    tr.appendChild(td4);
                    tr.appendChild(td5);

                    tbody.appendChild(tr);

                    }

                //start
                var tfoot = document.createElement('tfoot');            //body ekata data apend kirima, 2 = body eka / second child

            //average
                var tr2 = document.createElement('tr');
                var td6 = document.createElement('td');
                var td7 = document.createElement('td');
                var td8 = document.createElement('td');
                var td9 = document.createElement('td');

                td6.colSpan = 2;
                td6.innerHTML = "Average";
                td7.innerText = subjectbyclassroom.first_term_ave;
                td8.innerText = subjectbyclassroom.second_term_ave;
                td9.innerText = subjectbyclassroom.third_term_ave;

                tr2.appendChild(td6);
                tr2.appendChild(td7);
                tr2.appendChild(td8);
                tr2.appendChild(td9);

            //rank
                var tr3 = document.createElement('tr'); //average row
                var td10 = document.createElement('td');
                var td11 = document.createElement('td');
                var td12 = document.createElement('td');
                var td13 = document.createElement('td');

                td10.colSpan = 2;
                td10.innerHTML = "Rank";
                td11.innerText = subjectbyclassroom.first_term_rank;
                td12.innerText = subjectbyclassroom.second_term_rank;
                td13.innerText = subjectbyclassroom.third_term_rank;

                tr3.appendChild(td10);
                tr3.appendChild(td11);
                tr3.appendChild(td12);
                tr3.appendChild(td12);

                tfoot.appendChild(tr2);
                tfoot.appendChild(tr3);
                tblInnerStuReportCard.appendChild(tfoot);

               /* tbody.appendChild(tfoot);*/


                //end


                }
            }
        }


        function cmbClassroomCH(){
            studentbyclassroom = httpRequest("../studentregistration/listbystudent?studentid="+JSON.parse(cmbStudent.value).id,"GET");
            fillCombo(cmbClassroom,"Select Classroom Name",studentbyclassroom,"classroom_id.name","");
            cmbStudent.style.border = valid;


            /*txtTotalFees.value = parseFloat(sturegistrationbystudent.totalfee).toFixed(2);
            txtTotalFees.style.border = valid;
            stupayment.totalfee = txtTotalFees.value;*/

        }


        function loadForm() {
            stureport = new Object();
            oldstureport = null;     //form eka load wenakota old object ekak nathi nisa old object = null

            //many to many insert
            stureport.studentHasReportcardList = new Array();

            //fill and auto select , auto bind
            fillCombo3(cmbStudent,"Select student",students,"cname","regno","");
            fillCombo(cmbClassroom,"Select Classroom",classrooms,"name","");
            fillCombo(cmbAddedBy,"",employees,"callingname",session.getObject('activeuser').employeeId.callingname);


            stureport.employee_id=JSON.parse(cmbAddedBy.value);
            cmbAddedBy.disabled = true;

             var today = new Date();            //create date object
             var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
             if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
             var date = today.getDate();        // 1 to 31 range
             if(date<10) date = "0"+date;

            dteAddedDate.value=today.getFullYear()+"-"+month+"-"+date;
            stureport.addeddate=dteAddedDate.value;
            dteAddedDate.disabled = true;

            //load wenakota text field empty
         //   txtsDescription.value = "";

            //auto load disable ewata valid color enawa
            setStyle(initial);
            dteAddedDate.style.border=valid;
            cmbAddedBy.style.border=valid;

          //   disableButtons(false, true, true);

        }


 //finish
        function setStyle(style) {

            cmbStudent.style.border = style;
            cmbClassroom.style.border = style;
            cmbAddedBy.style.border = style;

          //  txtTotalFees.style.border = style;
          //  txtPaidAmount.style.border = style;
         //   txtBalance.style.border = style;
         //   txtsDescription.style.border = style;
            dteAddedDate.style.border = style;

        }

//finish
       /* function disableButtons(add, upd, del) {

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
            for(index in studentreportcards){
                if(studentreportcards[index].studentregstatus_id.name =="Deleted"){
                    tblStuReport.children[1].children[index].style.color = "#f00";
                    tblStuReport.children[1].children[index].style.border = "2px solid red";
                    tblStuReport.children[1].children[index].lastChild.children[1].disabled = true;
                    tblStuReport.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";
                }
            }


        }*/

//finish
        function getErrors() {

            var errors = "";
            addvalue = "";

            if (stureport.student_id == null)
                errors = errors + "\n" + "Student is Not Entered";
            else  addvalue = 1;

            if (stureport.acadamicyear_id == null)
                errors = errors + "\n" + "Aacadamic year is Not Entered";
            else  addvalue = 1;

            if (stureport.grade_id == null)
                errors = errors + "\n" + "Grade is Not Entered";
            else  addvalue = 1;

            if (stureport.classroom_id == null)
                errors = errors + "\n" + "Classroom is Not Entered";
            else  addvalue = 1;

//check
           /* if (stureport.studentHasReportcardList.length  == 0){
                txtEventName.style.border = invalid;
                errors = errors + "\n" + "Event is Not Selected";
            }else  addvalue = 1;

            return errors;*/

        }

//finish
        function btnAddMC(){
            if(getErrors()==""){
                if(txtsDescription.value == "" ){
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