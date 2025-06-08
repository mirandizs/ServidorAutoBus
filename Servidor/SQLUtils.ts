
import type { Request as Request } from 'express';


function AbsoluteCollumnName(Collumn: string) {
    const SplitCollumn = Collumn.split('.')
    const AbsoluteCollumnName = SplitCollumn[SplitCollumn.length - 1]
    return AbsoluteCollumnName
}
function QueryArray(ExpectedColumns: string[], RequestData: Request['body'] | any[]): [string[], any[], string[]] {
    const IsArray = Array.isArray(RequestData)
    const DataArray = IsArray ? RequestData : [RequestData];



    const Columns: string[] = IsArray ? ExpectedColumns.map(col => `\`${col}\``) : []
    const Values: any[] = []
    const Placeholders: string[] = []


    for (const Data of DataArray) {
        const rowPlaceholders: string[] = [];


        ExpectedColumns.forEach((Column) => {

            const CorrespondingValue = Data[AbsoluteCollumnName(Column)]
            if (CorrespondingValue != undefined && CorrespondingValue!='undefined') {
                Values.push(CorrespondingValue);
                rowPlaceholders.push('?')
                if (!IsArray) {
                    Columns.push(`\`${Column}\``)
                }
            } else if (IsArray) {
                Values.push(null);
                rowPlaceholders.push('?')
            }
        })


        if (rowPlaceholders.length > 0)
            Placeholders.push(`(${rowPlaceholders.join(', ')})`);
    }


    return [Columns, Values, Placeholders]
}

function GetWhereClause(RequestData: { [key: string]: any }, ConditionKeys: string[]): [string, any[]] {
    const Conditions: string[] = []
    const Values: any[] = []

    ConditionKeys.forEach((Collumn) => {
        const Val = RequestData[AbsoluteCollumnName(Collumn)]
        if (Val != undefined && Val!='undefined') {
            Conditions.push(Collumn)
            Values.push(Val)
        }
    })
    let WhereClause: string = Conditions.map(Key => `${Key}=?`).join(" AND ")
    if (WhereClause != '')
        WhereClause = ' WHERE ' + WhereClause

    return [WhereClause, Values]
}

function BuildSelectQuery(TargetTable: string, RequestData: Request['body'], ConditionKeys: string[], CollumnsToReturn: string[] = ['*'], Join: string = ''): [string, any[]] {
    let [Columns, Values] = QueryArray([], RequestData)

    const CollumnsToReturnString = CollumnsToReturn.join(',')
    const [WhereClause, WClauseValues] = GetWhereClause(RequestData, ConditionKeys)
    let Query = `SELECT ${CollumnsToReturnString} FROM  ${TargetTable} ${Join} ${WhereClause}`;



    return [Query, [...Values, ...WClauseValues]]
}

function BuildDeleteQuery(TargetTable: string, RequestData: Request['body'], ConditionKeys: string[]): [string, any[]] {
    let [Columns, Values] = QueryArray([], RequestData)

    const [WhereClause, WClauseValues] = GetWhereClause(RequestData, ConditionKeys)
    const Query = `DELETE FROM ${TargetTable} ${WhereClause}`;


    return [Query, [...Values, ...WClauseValues]]
}


function BuildUpdateQuery(TargetTable: string, ExpectedColumns: string[], RequestData: Request['body'], ConditionKeys: string[]): [string, any[]] {


    let [Columns, Values] = QueryArray(ExpectedColumns, RequestData)


    const [WhereClause, WClauseValues] = GetWhereClause(RequestData, ConditionKeys)
    const SetClause = Columns.map(col => `${col}=?`).join(", ")

    const Query = `UPDATE ${TargetTable} SET ${SetClause} ${WhereClause}`;

    return [Query, [...Values, ...WClauseValues]]
}

function BuildInsertQuery(TargetTable: string, ExpectedColumns: string[], RequestData: Request['body']): [string, any[]] {

    const [Columns, Values, Placeholders] = QueryArray(ExpectedColumns, RequestData)
    const Query = `INSERT INTO \`${TargetTable}\` (${Columns.join(', ')}) VALUES ${Placeholders.join(',')}`;

    return [Query, Values]
}

export default {
    BuildUpdateQuery,
    BuildInsertQuery,
    BuildDeleteQuery,
    BuildSelectQuery,
}