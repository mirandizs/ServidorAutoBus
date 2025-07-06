"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function AbsoluteCollumnName(Collumn) {
    const SplitCollumn = Collumn.split('.');
    const AbsoluteCollumnName = SplitCollumn[SplitCollumn.length - 1];
    return AbsoluteCollumnName;
}
function QueryArray(ExpectedColumns, RequestData) {
    const IsArray = Array.isArray(RequestData);
    const DataArray = IsArray ? RequestData : [RequestData];
    const Columns = IsArray ? ExpectedColumns.map(col => `\`${col}\``) : [];
    const Values = [];
    const Placeholders = [];
    for (const Data of DataArray) {
        const rowPlaceholders = [];
        ExpectedColumns.forEach((Column) => {
            const CorrespondingValue = Data[AbsoluteCollumnName(Column)];
            if (CorrespondingValue != undefined && CorrespondingValue != 'undefined') {
                Values.push(CorrespondingValue);
                rowPlaceholders.push('?');
                if (!IsArray) {
                    Columns.push(`\`${Column}\``);
                }
            }
            else if (IsArray) {
                Values.push(null);
                rowPlaceholders.push('?');
            }
        });
        if (rowPlaceholders.length > 0)
            Placeholders.push(`(${rowPlaceholders.join(', ')})`);
    }
    return [Columns, Values, Placeholders];
}
function GetWhereClause(RequestData, ConditionKeys) {
    const Conditions = [];
    const Values = [];
    ConditionKeys.forEach((Collumn) => {
        const Val = RequestData[AbsoluteCollumnName(Collumn)];
        if (Val != undefined && Val != 'undefined') {
            Conditions.push(Collumn);
            Values.push(Val);
        }
    });
    let WhereClause = Conditions.map(Key => `${Key}=?`).join(" AND ");
    if (WhereClause != '')
        WhereClause = ' WHERE ' + WhereClause;
    return [WhereClause, Values];
}
function BuildSelectQuery(TargetTable, RequestData, ConditionKeys, CollumnsToReturn = ['*'], Join = '') {
    let [Columns, Values] = QueryArray([], RequestData);
    const CollumnsToReturnString = CollumnsToReturn.join(',');
    const [WhereClause, WClauseValues] = GetWhereClause(RequestData, ConditionKeys);
    let Query = `SELECT ${CollumnsToReturnString} FROM  ${TargetTable} ${Join} ${WhereClause}`;
    return [Query, [...Values, ...WClauseValues]];
}
function BuildDeleteQuery(TargetTable, RequestData, ConditionKeys) {
    let [Columns, Values] = QueryArray([], RequestData);
    const [WhereClause, WClauseValues] = GetWhereClause(RequestData, ConditionKeys);
    const Query = `DELETE FROM ${TargetTable} ${WhereClause}`;
    return [Query, [...Values, ...WClauseValues]];
}
function BuildUpdateQuery(TargetTable, ExpectedColumns, RequestData, ConditionKeys) {
    let [Columns, Values] = QueryArray(ExpectedColumns, RequestData);
    const [WhereClause, WClauseValues] = GetWhereClause(RequestData, ConditionKeys);
    const SetClause = Columns.map(col => `${col}=?`).join(", ");
    const Query = `UPDATE ${TargetTable} SET ${SetClause} ${WhereClause}`;
    return [Query, [...Values, ...WClauseValues]];
}
function BuildInsertQuery(TargetTable, ExpectedColumns, RequestData) {
    const [Columns, Values, Placeholders] = QueryArray(ExpectedColumns, RequestData);
    const Query = `INSERT INTO \`${TargetTable}\` (${Columns.join(', ')}) VALUES ${Placeholders.join(',')}`;
    return [Query, Values];
}
exports.default = {
    BuildUpdateQuery,
    BuildInsertQuery,
    BuildDeleteQuery,
    BuildSelectQuery,
};
