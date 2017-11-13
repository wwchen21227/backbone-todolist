var AuditLog = Backbone.Model.extend({
    defaults: function(){
        return {
            action: null,
            task: null,
            logDate: new Date()
        }
    }
});

var AuditLogCollection = Backbone.Collection.extend({
    model: AuditLog,
    localStorage: new Backbone.LocalStorage(AUDIT_LOG_LOCAL_STOGAGE_KEY),
});

//Simple service to save CRUD audit log.
var AuditingService = function() {
    var auditLogs = new AuditLogCollection();

    this.getAuditLogs = function() {
        return auditLogs;
    };

    this.update = function(data) {
        auditLogs.create(data);
    };
};
