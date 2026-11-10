import { boolean, integer, jsonb, numeric, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
export const user = pgTable("user", {
 id:text("id").primaryKey(), name:text("name").notNull(), email:text("email").notNull().unique(),
 emailVerified:boolean("email_verified").notNull().default(false), image:text("image"),
 role:text("role").notNull().default("user"), createdAt:timestamp("created_at").notNull().defaultNow(),
 updatedAt:timestamp("updated_at").notNull().defaultNow()
});
export const session = pgTable("session", {
 id:text("id").primaryKey(), expiresAt:timestamp("expires_at").notNull(), token:text("token").notNull().unique(),
 createdAt:timestamp("created_at").notNull().defaultNow(), updatedAt:timestamp("updated_at").notNull().defaultNow(),
 ipAddress:text("ip_address"), userAgent:text("user_agent"), userId:text("user_id").notNull().references(()=>user.id,{onDelete:"cascade"})
});
export const account = pgTable("account", {
 id:text("id").primaryKey(), accountId:text("account_id").notNull(), providerId:text("provider_id").notNull(),
 userId:text("user_id").notNull().references(()=>user.id,{onDelete:"cascade"}), accessToken:text("access_token"),
 refreshToken:text("refresh_token"), idToken:text("id_token"), accessTokenExpiresAt:timestamp("access_token_expires_at"),
 refreshTokenExpiresAt:timestamp("refresh_token_expires_at"), scope:text("scope"), password:text("password"),
 createdAt:timestamp("created_at").notNull().defaultNow(), updatedAt:timestamp("updated_at").notNull().defaultNow()
});
export const verification = pgTable("verification", {
 id:text("id").primaryKey(), identifier:text("identifier").notNull(), value:text("value").notNull(),
 expiresAt:timestamp("expires_at").notNull(), createdAt:timestamp("created_at").defaultNow(), updatedAt:timestamp("updated_at").defaultNow()
});
export const wallets = pgTable("wallets", {
 id:text("id").primaryKey(), userId:text("user_id").notNull().unique().references(()=>user.id,{onDelete:"cascade"}),
 balanceCents:integer("balance_cents").notNull().default(100000), lastDemoCreditAt:timestamp("last_demo_credit_at"),
 createdAt:timestamp("created_at").notNull().defaultNow(), updatedAt:timestamp("updated_at").notNull().defaultNow()
});
export const walletLedger = pgTable("wallet_ledger", {
 id:text("id").primaryKey(), userId:text("user_id").notNull().references(()=>user.id,{onDelete:"cascade"}),
 type:text("type").notNull(), amountCents:integer("amount_cents").notNull(), balanceAfterCents:integer("balance_after_cents").notNull(),
 referenceId:text("reference_id"), idempotencyKey:text("idempotency_key").notNull().unique(), note:text("note"),
 createdAt:timestamp("created_at").notNull().defaultNow()
});
export const fixtures = pgTable("fixtures", {
 id:text("id").primaryKey(), externalId:text("external_id").notNull().unique(), sportKey:text("sport_key").notNull(),
 sportTitle:text("sport_title").notNull(), league:text("league").notNull(), homeTeam:text("home_team").notNull(),
 awayTeam:text("away_team").notNull(), startTime:timestamp("start_time").notNull(), status:text("status").notNull().default("upcoming"),
 homeScore:integer("home_score"), awayScore:integer("away_score"), lastSyncedAt:timestamp("last_synced_at").notNull().defaultNow(),
 createdAt:timestamp("created_at").notNull().defaultNow(), updatedAt:timestamp("updated_at").notNull().defaultNow()
});
export const markets = pgTable("markets", {
 id:text("id").primaryKey(), fixtureId:text("fixture_id").notNull().references(()=>fixtures.id,{onDelete:"cascade"}),
 externalKey:text("external_key").notNull(), name:text("name").notNull(), active:boolean("active").notNull().default(true),
 updatedAt:timestamp("updated_at").notNull().defaultNow()
}, t=>({unique:uniqueIndex("markets_fixture_external_unique").on(t.fixtureId,t.externalKey)}));
export const selections = pgTable("selections", {
 id:text("id").primaryKey(), marketId:text("market_id").notNull().references(()=>markets.id,{onDelete:"cascade"}),
 name:text("name").notNull(), odds:numeric("odds",{precision:10,scale:3}).notNull(), active:boolean("active").notNull().default(true),
 updatedAt:timestamp("updated_at").notNull().defaultNow()
}, t=>({unique:uniqueIndex("selections_market_name_unique").on(t.marketId,t.name)}));
export const bets = pgTable("bets", {
 id:text("id").primaryKey(), userId:text("user_id").notNull().references(()=>user.id,{onDelete:"cascade"}),
 status:text("status").notNull().default("open"), stakeCents:integer("stake_cents").notNull(),
 totalOdds:numeric("total_odds",{precision:12,scale:4}).notNull(), potentialPayoutCents:integer("potential_payout_cents").notNull(),
 actualPayoutCents:integer("actual_payout_cents"), createdAt:timestamp("created_at").notNull().defaultNow(), settledAt:timestamp("settled_at")
});
export const betLegs = pgTable("bet_legs", {
 id:text("id").primaryKey(), betId:text("bet_id").notNull().references(()=>bets.id,{onDelete:"cascade"}),
 selectionId:text("selection_id").notNull().references(()=>selections.id), fixtureName:text("fixture_name").notNull(),
 marketName:text("market_name").notNull(), selectionName:text("selection_name").notNull(), result:text("result").notNull().default("pending"),
 oddsAtPlacement:numeric("odds_at_placement",{precision:10,scale:3}).notNull()
});
export const responsibleLimits = pgTable("responsible_limits", {
 id:text("id").primaryKey(), userId:text("user_id").notNull().unique().references(()=>user.id,{onDelete:"cascade"}),
 dailyStakeLimitCents:integer("daily_stake_limit_cents").notNull().default(100000), sessionMinutes:integer("session_minutes").notNull().default(60),
 coolOffUntil:timestamp("cool_off_until"), selfExcludedUntil:timestamp("self_excluded_until"), updatedAt:timestamp("updated_at").notNull().defaultNow()
});
export const auditLogs = pgTable("audit_logs", {
 id:text("id").primaryKey(), actorUserId:text("actor_user_id").references(()=>user.id), action:text("action").notNull(),
 entityType:text("entity_type").notNull(), entityId:text("entity_id"), details:jsonb("details"), createdAt:timestamp("created_at").notNull().defaultNow()
});
export const authSchema = { user, session, account, verification };
