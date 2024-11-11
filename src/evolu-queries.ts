import { type TEntryId, type TRecurringConfigId, evolu } from "@/evolu-db";
import {
  type ExtractRow,
  type NotNull,
  cast,
  jsonArrayFrom,
  jsonObjectFrom,
} from "@evolu/react";

type TNarrowed = {
  name: NotNull;
  date: NotNull;
  amount: NotNull;
  fullfilled: NotNull;
  currencyCode: NotNull;
  type: NotNull;
};

const queryOptions = {
  logQueryExecutionTime: process.env.NODE_ENV === "development",
  logExplainQueryPlan: process.env.NODE_ENV === "development",
};

export const recurringConfigsQuery = (rId: TRecurringConfigId | null = null) =>
  evolu.createQuery(
    (db) =>
      db
        .selectFrom("recurringConfig as r")
        .select([
          "r.id as recurringConfigId",
          "r.frequency",
          "r.interval",
          "r.every",
          "r.startDate",
          "r.endDate",
          "r.createdAt",
        ])
        .where("r.isDeleted", "is not", cast(true))
        .$if(!!rId, (qb) => qb.where("r.id", "=", rId))
        .$narrowType<
          TNarrowed & {
            frequency: NotNull;
          }
        >()
        .orderBy("r.createdAt")
        .select((eb) => [
          jsonArrayFrom(
            eb
              .selectFrom("exclusion")
              .select([
                "id",
                "recurringId",
                "date",
                "modifiedDate",
                "index",
                "reason",
                "applyToSubsequents",
                "modifiedEntryId",
              ])
              .whereRef("r.id", "=", "exclusion.recurringId")
              .select((eb) => [
                jsonObjectFrom(
                  eb
                    .selectFrom("entry as modifiedEntry")
                    .select([
                      "id as entryId",
                      "name",
                      "type",
                      "currencyCode",
                      "amount",
                      "date",
                      "createdAt",
                      "fullfilled",
                      "recurringId",
                      "updatedAt",
                      "groupId",
                      "tagId",
                    ])
                    .$narrowType<TNarrowed>()
                    .select((eb) => [
                      jsonObjectFrom(
                        eb
                          .selectFrom("entryGroup")
                          .select(["id as groupId", "name"])
                          .where("entryGroup.isDeleted", "is not", cast(true))
                          .whereRef(
                            "entryGroup.id",
                            "=",
                            "modifiedEntry.groupId"
                          )
                      ).as("entryGroup"),
                    ])
                    .select((eb) => [
                      jsonObjectFrom(
                        eb
                          .selectFrom("entryTag")
                          .select(["id as tagId", "name", "color"])
                          .where("entryTag.isDeleted", "is not", cast(true))
                          .whereRef("entryTag.id", "=", "modifiedEntry.tagId")
                      ).as("entryTag"),
                    ])
                    .whereRef(
                      "modifiedEntry.id",
                      "=",
                      "exclusion.modifiedEntryId"
                    )
                ).as("modifiedEntry"),
              ])
              .where("exclusion.isDeleted", "is not", cast(true))
          ).as("exclusions"),
        ])
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("entry")
              .select([
                "id as entryId",
                "name",
                "type",
                "currencyCode",
                "amount",
                "date",
                "createdAt",
                "fullfilled",
                "recurringId",
                "updatedAt",
                "groupId",
                "tagId",
              ])
              .select((eb) => [
                jsonObjectFrom(
                  eb
                    .selectFrom("entryGroup")
                    .select(["id as groupId", "name"])
                    .where("entryGroup.isDeleted", "is not", cast(true))
                    .whereRef("entryGroup.id", "=", "entry.groupId")
                ).as("entryGroup"),
              ])
              .select((eb) => [
                jsonObjectFrom(
                  eb
                    .selectFrom("entryTag")
                    .select(["id as tagId", "name", "color"])
                    .where("entryTag.isDeleted", "is not", cast(true))
                    .whereRef("entryTag.id", "=", "entry.tagId")
                ).as("entryTag"),
              ])
              .whereRef("r.id", "=", "entry.recurringId")
              .where("entry.isDeleted", "is not", cast(true))
              .orderBy("entry.date", "asc")
              .$narrowType<TNarrowed>()
          ).as("originEntry"),
        ]),
    queryOptions
  );
export type TRecurringConfigRow = ExtractRow<
  ReturnType<typeof recurringConfigsQuery>
>;

export const groupsQuery = evolu.createQuery(
  (db) =>
    db
      .selectFrom("entryGroup")
      .select(["id", "name"])
      .where("isDeleted", "is not", cast(true))
      .orderBy("createdAt"),
  queryOptions
);

export type TGroupsRow = Readonly<ExtractRow<typeof groupsQuery>>;

export const tagsQuery = evolu.createQuery(
  (db) =>
    db
      .selectFrom("entryTag")
      .select(["id", "name", "color", "suggestId"])
      .where("isDeleted", "is not", cast(true))
      .where("name", "is not", null)
      .where("color", "is not", null)
      .$narrowType<{ name: NotNull }>()
      .orderBy("createdAt"),
  queryOptions
);

export type TTagsRow = Readonly<ExtractRow<typeof tagsQuery>>;

export const entriesQuery = (eId: TEntryId | null = null) =>
  evolu.createQuery(
    (db) =>
      db
        .selectFrom("entry")
        .select([
          "id as entryId",
          "name",
          "type",
          "currencyCode",
          "amount",
          "date",
          "createdAt",
          "fullfilled",
          "recurringId",
          "updatedAt",
          "groupId",
          "tagId",
        ])
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("entryGroup")
              .select(["id as groupId", "name"])
              .where("entryGroup.isDeleted", "is not", cast(true))
              .whereRef("entryGroup.id", "=", "entry.groupId")
          ).as("entryGroup"),
        ])
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("entryTag")
              .select(["id as tagId", "name", "color"])
              .where("entryTag.isDeleted", "is not", cast(true))
              .whereRef("entryTag.id", "=", "entry.tagId")
          ).as("entryTag"),
        ])
        .where("isDeleted", "is not", cast(true))
        .$if(!!eId, (qb) => qb.where("id", "=", eId))
        .where("name", "is not", null)
        .where("type", "is not", null)
        .where("amount", "is not", null)
        .where("recurringId", "is", null)
        .$narrowType<TNarrowed>()
        .orderBy("date", "asc"),
    queryOptions
  );

export const exclusionsQuery = (recurringId: TRecurringConfigId) =>
  evolu.createQuery(
    (db) =>
      db
        .selectFrom("exclusion")
        .select([
          "id as exclusionId",
          "recurringId",
          "modifiedEntryId",
          "applyToSubsequents",
          "date",
          "modifiedDate",
          "index",
          "reason",
        ])
        .where("isDeleted", "is not", cast(true))
        .where("recurringId", "is", recurringId)
        .$narrowType<{
          recurringId: NotNull;
          reason: NotNull;
          date: NotNull;
        }>()
        .orderBy("createdAt"),
    queryOptions
  );

export type TEntryRow = ExtractRow<ReturnType<typeof entriesQuery>>;
export type TExclusionRow = TRecurringConfigRow["exclusions"][number];
export type TModifiedEntry = TExclusionRow["modifiedEntry"];
