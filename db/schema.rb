# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_08_20_013655) do
  create_table "action_text_rich_texts", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.datetime "updated_at", null: false
    t.index ["record_type", "record_id", "name"], name: "index_action_text_rich_texts_uniqueness", unique: true
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "activities", force: :cascade do |t|
    t.string "action"
    t.datetime "created_at", null: false
    t.json "metadata"
    t.integer "trackable_id", null: false
    t.string "trackable_type", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.integer "workspace_id", null: false
    t.index ["trackable_type", "trackable_id"], name: "index_activities_on_trackable"
    t.index ["user_id"], name: "index_activities_on_user_id"
    t.index ["workspace_id"], name: "index_activities_on_workspace_id"
  end

  create_table "boards", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name"
    t.integer "project_id", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_boards_on_project_id"
  end

  create_table "comments", force: :cascade do |t|
    t.text "body"
    t.integer "commentable_id", null: false
    t.string "commentable_type", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["commentable_type", "commentable_id"], name: "index_comments_on_commentable"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "documents", force: :cascade do |t|
    t.integer "author_id"
    t.text "content"
    t.string "cover_image"
    t.datetime "created_at", null: false
    t.string "icon"
    t.boolean "is_folder", default: false
    t.integer "parent_id"
    t.integer "position", default: 0
    t.integer "project_id"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.integer "workspace_id", null: false
    t.index ["author_id"], name: "index_documents_on_author_id"
    t.index ["parent_id"], name: "index_documents_on_parent_id"
    t.index ["project_id"], name: "index_documents_on_project_id"
    t.index ["workspace_id"], name: "index_documents_on_workspace_id"
  end

  create_table "issue_labels", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "issue_id", null: false
    t.integer "label_id", null: false
    t.datetime "updated_at", null: false
    t.index ["issue_id"], name: "index_issue_labels_on_issue_id"
    t.index ["label_id"], name: "index_issue_labels_on_label_id"
  end

  create_table "issue_statuses", force: :cascade do |t|
    t.string "category"
    t.string "color"
    t.datetime "created_at", null: false
    t.string "name"
    t.integer "position"
    t.integer "project_id", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_issue_statuses_on_project_id"
  end

  create_table "issues", force: :cascade do |t|
    t.integer "assignee_id"
    t.integer "board_id"
    t.datetime "created_at", null: false
    t.integer "creator_id"
    t.text "description"
    t.date "due_date"
    t.string "identifier", null: false
    t.integer "issue_status_id", null: false
    t.integer "milestone_id"
    t.integer "number", null: false
    t.integer "parent_id"
    t.float "position"
    t.integer "priority", default: 0
    t.integer "project_id", null: false
    t.date "start_date"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["assignee_id"], name: "index_issues_on_assignee_id"
    t.index ["board_id"], name: "index_issues_on_board_id"
    t.index ["creator_id"], name: "index_issues_on_creator_id"
    t.index ["issue_status_id"], name: "index_issues_on_issue_status_id"
    t.index ["milestone_id"], name: "index_issues_on_milestone_id"
    t.index ["parent_id"], name: "index_issues_on_parent_id"
    t.index ["project_id", "identifier"], name: "index_issues_on_project_id_and_identifier", unique: true
    t.index ["project_id", "number"], name: "index_issues_on_project_id_and_number", unique: true
    t.index ["project_id"], name: "index_issues_on_project_id"
  end

  create_table "labels", force: :cascade do |t|
    t.string "color"
    t.datetime "created_at", null: false
    t.string "name"
    t.datetime "updated_at", null: false
    t.integer "workspace_id", null: false
    t.index ["workspace_id"], name: "index_labels_on_workspace_id"
  end

  create_table "milestones", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.integer "project_id", null: false
    t.date "start_date"
    t.string "status"
    t.date "target_date"
    t.string "title"
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_milestones_on_project_id"
  end

  create_table "projects", force: :cascade do |t|
    t.string "color"
    t.datetime "created_at", null: false
    t.date "deadline"
    t.string "default_view", default: "board"
    t.text "description"
    t.string "icon"
    t.string "identifier_prefix"
    t.integer "issues_count", default: 0
    t.string "name"
    t.integer "progress"
    t.string "status"
    t.datetime "updated_at", null: false
    t.integer "workspace_id", null: false
    t.index ["workspace_id"], name: "index_projects_on_workspace_id"
  end

  create_table "users", force: :cascade do |t|
    t.text "bio"
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "first_name"
    t.string "job_title"
    t.string "last_name"
    t.string "provider"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "uid"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["provider", "uid"], name: "index_users_on_provider_and_uid", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "whiteboards", force: :cascade do |t|
    t.text "content"
    t.string "cover_image"
    t.datetime "created_at", null: false
    t.text "description"
    t.string "icon"
    t.text "mermaid_code"
    t.string "mode", default: "hybrid", null: false
    t.integer "position", default: 0, null: false
    t.integer "project_id", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.integer "workspace_id", null: false
    t.index ["project_id"], name: "index_whiteboards_on_project_id"
    t.index ["user_id"], name: "index_whiteboards_on_user_id"
    t.index ["workspace_id"], name: "index_whiteboards_on_workspace_id"
  end

  create_table "workspaces", force: :cascade do |t|
    t.string "billing_email"
    t.string "color"
    t.string "company_number"
    t.datetime "created_at", null: false
    t.text "description"
    t.string "industry"
    t.string "name"
    t.string "team_size"
    t.string "timezone"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.string "visibility"
    t.string "website"
    t.index ["user_id"], name: "index_workspaces_on_user_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "activities", "users"
  add_foreign_key "activities", "workspaces"
  add_foreign_key "boards", "projects"
  add_foreign_key "comments", "users"
  add_foreign_key "documents", "documents", column: "parent_id"
  add_foreign_key "documents", "projects"
  add_foreign_key "documents", "users", column: "author_id"
  add_foreign_key "documents", "workspaces"
  add_foreign_key "issue_labels", "issues"
  add_foreign_key "issue_labels", "labels"
  add_foreign_key "issue_statuses", "projects"
  add_foreign_key "issues", "boards"
  add_foreign_key "issues", "issue_statuses"
  add_foreign_key "issues", "issues", column: "parent_id"
  add_foreign_key "issues", "milestones"
  add_foreign_key "issues", "projects"
  add_foreign_key "issues", "users", column: "assignee_id"
  add_foreign_key "issues", "users", column: "creator_id"
  add_foreign_key "labels", "workspaces"
  add_foreign_key "milestones", "projects"
  add_foreign_key "projects", "workspaces"
  add_foreign_key "whiteboards", "projects"
  add_foreign_key "whiteboards", "users"
  add_foreign_key "whiteboards", "workspaces"
  add_foreign_key "workspaces", "users"
end
