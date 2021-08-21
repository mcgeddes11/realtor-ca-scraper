"use strict";
var bcaPortal = (function (n) {
    function r(n) {
        c("Search input is invalid", n);
    }
    function a(n) {
        c("No search results found", n);
    }
    function tt(n) {
        c("Too many search results", n);
    }
    function c(t, i) {
        n("#divInProgress").modal("hide");
        n("#divValidationsLabel").html(t);
        n("#pvalidationMessage").html(i);
        n("#divValidations").modal("show");
        e = !0;
    }
    function p(r, u) {
        n("#txtRollNumber").prop("disabled", !1);
        n("#txtJurisdiction").val(u);
        t = r;
        i = u;
        n("#txtRollNumber").focus();
    }
    function b(t) {
        t ? n("#txtLot").prop("disabled", !1).removeClass("disabled") : n("#txtLot").prop("disabled", !0).addClass("disabled");
    }
    function k(t) {
        t ? n("#txtRollNumber").prop("disabled", !1).removeClass("disabled") : n("#txtRollNumber").prop("disabled", !0).addClass("disabled");
    }
    function d(i) {
        t == "" && n("#txtJurisdiction").val().trim() == i && (h ? setTimeout(d, 500, i) : r("Please select a valid Jurisdiction first"));
    }
    function g() {
        if (t == "") {
            var i = n("#txtJurisdiction").val().trim();
            i != "" && /^\d{3}$/.test(i) ? setTimeout(d, 1e3, i) : r("Please select a valid Jurisdiction first");
            n("#txtJurisdiction").focus();
        }
    }
    var t = "",
        i = "",
        e = !1,
        h = !1,
        f = function (n, t, i) {
            bcaPortalCommon.processError(n, i);
        },
        s = !1;
    e = !1;
    var v = function (t, i) {
            var r = n("#tbladdressresults").DataTable({
                bSort: !1,
                bLength: !1,
                bSearch: !0,
                destroy: !0,
                bInfo: !0,
                infoCallback: function (t, i, r, u, f) {
                    let e = n(this).closest(".dataTables_wrapper").find(".dataTables_paginate");
                    return f == 0
                        ? (console.log(e), e.toggle(!1), "<span class='mobile-only'>No data available</span>")
                        : (e.toggle(!0), "Displaying " + i + " to " + r + " of " + f + " properties (filtered from a total of " + u + "  properties)");
                },
                language: {
                    lengthMenu: 'Show <select class="userpages" id="ddlUserPages"><option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="-1">All</option></select> properties per page',
                    sSearch: "",
                    searchPlaceholder: "Search properties",
                    emptyTable: "No data available",
                    infoEmpty: "",
                    zeroRecords: "No data available",
                },
                dom: '<"top"fl>rt<"bottom"ip><"clear">',
                columnDefs: [
                    { width: "10%", targets: 0 },
                    { width: "10%", targets: 1 },
                    {
                        width: "50%",
                        targets: 2,
                        render: function (t, i, r) {
                            return i === "display"
                                ? n("<a>")
                                      .attr("href", "#")
                                      .attr("onclick", "bcaPortal.navigate('" + r[4] + "')")
                                      .text(t)
                                      .wrap("<div></div>")
                                      .parent()
                                      .html()
                                : t;
                        },
                    },
                    { width: "30%", targets: 3 },
                ],
                sAjaxSource: t,
                fnServerData: function (t, r, u) {
                    r = i;
                    n.ajax({
                        dataType: "text",
                        contentType: "text/plain",
                        type: "GET",
                        url: t,
                        data: r,
                        success: function (t) {
                            if (((t = t.toString()), n("#divInProgress").modal("hide"), t.toLowerCase() == "found_no_results" || t.toLowerCase() == "input_invalid"))
                                a("We were unable to find any properties matching your search criteria. Please make sure you have entered the information correctly or use a different type of search on another property characteristic.");
                            else if (t.toLowerCase() == "too_many_results") tt("The system returned too many results for this search to display. Please use an alternate search type for more precise results");
                            else {
                                var i = n.parseJSON(t);
                                i.sEcho != "1" ? (u(i), n("#divInProgress").modal("hide"), n("#searchresultsModal").modal("show")) : o(i.aaData[0][4]);
                            }
                        },
                        error: f,
                    });
                },
                fnDrawCallback: function () {
                    n(".image-details").bind("click", rt);
                },
            });
        },
        it = function () {
            n("#txtJurisdiction").hide();
            n("#rsbSearch").hide();
            n("#txtRollNumber").hide();
            n("#txtPlan").hide();
            n("#txtLot").hide();
            n("#txtPID").hide();
        },
        o = function (n) {
            window.location.href = act != "" && act != undefined ? l + "/Property/Info/" + n + "/?act=" + act : l + "/Property/Info/" + n;
        },
        rt = function () {
            alert("showing some details");
        },
        ut = function () {
            n("#txtJurisdiction").val("");
            n("#rsbSearch").val("");
            n("#txtRollNumber").val("");
            n("#txtPlan").val("");
            n("#txtLot").val("");
            n("#txtPID").val("");
        },
        y = function () {
            if (s == !1) {
                var t = n("#ddlSubUnits").val();
                t != undefined && t != "" && o(t);
            }
        },
        ft = function (t) {
            var i, r;
            n("#divInProgress").modal("show");
            n.ajaxSetup({ cache: !1 });
            i = [];
            i.push({ name: "multiunitId", value: t });
            r = !1;
            n("#subunitcontents").css("width", "440px");
            n("#ddlSubUnits").css("width", "400px");
            n("#ddlSubUnits").html("");
            n.ajax({
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                type: "GET",
                url: "/Property/Search/GetSubUnits/" + t,
                data: i,
                success: function (t) {
                    n("#divInProgress").modal("hide");
                    n("#modalsubunits").modal("show");
                    var u = "<option value=''>Select unit</option>",
                        i = t;
                    n.each(i.Units, function (n, t) {
                        u += "<option value=" + t.Oa000_OID + ">" + t.Address + "</option>";
                        t.Address.length > 45 && (r = !0);
                    });
                    r == !0 && (n("#subunitcontents").css("width", "540px"), n("#ddlSubUnits").css("width", "500px"));
                    n("#spanunitCount").text("Multiple units found - (" + i.TotalCount + ")");
                    i.IsMoreThanLimit == !0 ? n("#maxLimitMessage").show() : n("#maxLimitMessage").hide();
                    n("#ddlSubUnits").html(u);
                },
                error: f,
            });
        },
        et = function () {
            n("#rsbSearch").autocomplete({
                source: function (t, i) {
                    var r = n("#rsbSearch").val();
                    n.ajax({
                        url: "/Property/Search/GetByAddress?addr=" + encodeURIComponent(r),
                        type: "GET",
                        contentType: "application/json",
                        success: function (t) {
                            i(
                                n.map(t, function (n) {
                                    return { label: n.label, value: n.value, gid: n.gid };
                                })
                            );
                        },
                        error: f,
                    });
                },
                focus: function (n) {
                    n.preventDefault();
                },
                open: function () {
                    navigator.userAgent.match(/(iPod|iPhone|iPad)/) && n(".ui-autocomplete").off("menufocus hover mouseover mouseenter");
                },
                select: function (t, i) {
                    if (i.item.label.indexOf(" (select to see all units...)") !== -1) {
                        t.preventDefault();
                        var r = i.item.label.replace(" (select to see all units...)", "");
                        n("#rsbSearch").val(r);
                        ft(i.item.gid);
                    } else return i.item.label.indexOf("No results") !== -1 || i.item.label.indexOf("Has no results") !== -1 ? !1 : (n("#rsbSearch").val(""), o(i.item.value), !1);
                },
                timeout: 15e3,
                minLength: 3,
            });
            n("#txtJurisdiction").autocomplete({
                source: function (t, i) {
                    n.ajax({
                        url: "/Property/Jurisdiction/JurisdictionAutoComplete",
                        type: "POST",
                        dataType: "json",
                        data: t,
                        success: function (t) {
                            i(
                                n.map(t, function (n) {
                                    return { value: n.value, label: n.label };
                                })
                            );
                        },
                        error: f,
                    });
                },
                search: function () {
                    var t = n("#txtJurisdiction").val().trim();
                    t != "" &&
                        /^\d{3}$/.test(t) &&
                        ((h = !0),
                        n.ajax({
                            url: "/Property/Jurisdiction/" + t,
                            type: "GET",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            success: function (n) {
                                n != "" && p(n.JurisdictionCode, n.Description);
                                h = !1;
                            },
                            error: f,
                            timeout: 1e4,
                        }));
                },
                select: function (n, t) {
                    return p(t.item.value, t.item.label), !1;
                },
                minLength: 3,
            });
        };
    var ot = function () {
            n.ajaxSetup({ cache: !1 });
            var i = n("#txtPlan").val().trim(),
                t = n("#txtLot").val().trim();
            t != "" && (t = t.trim());
            i != ""
                ? (n("span.modalPlanSection").text("Plan: " + i),
                  v("/Property/Search/GetByPlan?plan=" + encodeURIComponent(i) + "&lot=" + encodeURIComponent(t), [
                      { name: "Plan", value: i },
                      { name: "Lot", value: t },
                  ]))
                : r("Plan is a mandatory input for search. Please enter plan#.");
        },
        st = function () {
            var t, i, u;
            n.ajaxSetup({ cache: !1 });
            t = n("#txtPID").val().trim().replace(/-/g, "");
            i = /^\d{1,9}$/;
            t != "" && i.test(t) ? ((u = "/Property/Search/GetByPid/" + t), v(u, [{ name: "PID", value: t }])) : r("The PID seems to be invalid or empty. Please enter your PID.");
        },
        ht = function () {
            var u, e, s, h;
            if ((n.ajaxSetup({ cache: !1 }), (u = n("#txtRollNumber").val().trim()), (e = n("#txtJurisdiction").val().trim()), t == "" || e != i)) {
                n("#txtJurisdiction").val("");
                t = "";
                i = "";
                r("The Jurisdiction seems to be invalid. Please confirm.");
                n("#txtJurisdiction").focus();
                return;
            }
            if (u == "") {
                r("Please enter your Roll#.");
                n("#txtRollNumber").focus();
                return;
            }
            if (((s = /^[A-Za-z\d\.\-\s\/]{5,22}$/), !s.test(u))) {
                r("The Roll# seems to be invalid. Please enter your Roll#.");
                n("#txtRollNumber").focus();
                return;
            }
            h = "/Property/Search/GetByRollNumber/" + t + "?roll=" + encodeURIComponent(u);
            n.ajax({
                contentType: "application/json; charset=utf-8",
                type: "GET",
                url: h,
                success: function (t) {
                    if ((n("#divInProgress").modal("hide"), t.toLowerCase().indexOf("ok-") > -1)) {
                        var i = t.replace("ok-", "");
                        o(i);
                    } else a("We were unable to find any properties matching your search criteria. Please make sure you have entered the information correctly or use a different type of search on another property characteristic.");
                },
                error: f,
            });
        },
        u = function () {
            e == !1 && n("#divInProgress").modal("show");
            var t = n("#ddlSearchType").val();
            t.toLowerCase() == "plan" ? ot() : t.toLowerCase() == "pid" ? st() : t.toLowerCase() == "roll" && ht();
        },
        w = function (i) {
            var r = n(i).val();
            it();
            ut();
            switch (r.toLowerCase()) {
                case "plan":
                    n("#txtPlan").show();
                    n("#txtLot").show();
                    n("#txtLot").prop("disabled", !0);
                    n("#btnSearch").show();
                    break;
                case "roll":
                    n("#txtJurisdiction").show();
                    n("#txtRollNumber").show();
                    n("#txtRollNumber").prop("disabled", !0);
                    t = "";
                    n("#btnSearch").show();
                    break;
                case "pid":
                    n("#txtPID").show();
                    n("#btnSearch").show();
                    break;
                case "address":
                    n("#rsbSearch").show();
                    n("#btnSearch").hide();
            }
        };
    var nt = function () {
            document.getElementById("ddlSearchType").onchange = function () {
                w(n(this));
            };
            n("#ddlSubUnits").mouseup(function () {
                s = !1;
            });
            n("#ddlSubUnits").change(function () {
                y();
            });
            n("#ddlSubUnits").keydown(function (n) {
                return (n.keyCode == 38 || n.keyCode == 40) && (s = !0), n.keyCode == 13 && ((s = !1), y()), !0;
            });
            n("#btnSearch").keypress(function (n) {
                n.keyCode == 13 && u();
            });
            n("#btnSearch").click(function () {
                u();
            });
            n("#txtPID").keyup(function (n) {
                n.keyCode == 13 && (n.preventDefault(), u());
            });
            n("#txtPlan").keyup(function (t) {
                if (t.keyCode == 13) t.preventDefault(), u();
                else {
                    var i = n(this).val().trim() != "";
                    b(i);
                }
            });
            n("#txtPlan").on("paste", function (n) {
                var t = n.clipboardData || n.originalEvent.clipboardData || window.clipboardData,
                    i = t.getData("Text").trim();
                b(i != "");
            });
            n("#txtLot").keyup(function (n) {
                n.keyCode == 13 && (n.preventDefault(), u());
            });
            n("#txtJurisdiction").keydown(function (n) {
                n.keyCode == 9 && (n.preventDefault(), g());
            });
            n("#txtJurisdiction").keyup(function (r) {
                r.keyCode == 13 ? (r.preventDefault(), g()) : t != "" && n("#txtJurisdiction").val().trim() != i && ((t = ""), (i = ""), k(!1));
            });
            n("#txtJurisdiction").on("paste", function (n) {
                var r = even.originalEvent.clipboardData || n.clipboardData || window.clipboardData,
                    u = r.getData("Text");
                t != "" && ((r = n.clipboardData || window.clipboardData), (u = r.getData("Text")), i != u && ((t = ""), (i = ""), k(!1)));
            });
            n("#txtRollNumber").keyup(function (t) {
                t.keyCode == 13 && n("#txtRollNumber").val().trim() != "" && (t.preventDefault(), u());
            });
        },
        ct = function () {
            n("#divValidations").modal("hide");
            n(".modal-backdrop").remove();
            e = !1;
        },
        lt = function () {
            n("#searchresultsModal").modal("hide");
            n(".modal-backdrop").remove();
            e = !1;
        },
        l = "",
        at = function (n) {
            l = n;
        },
        vt = function () {
            et();
            nt();
        };
    return { ready: vt, navigate: o, searchtypechange: w, assignEvents: nt, LoadResults: u, clearValidationsbackdrop: ct, clearResultsbackdrop: lt, SearchSiteUrl: at };
})(jQuery);
jQuery(bcaPortal.ready);
