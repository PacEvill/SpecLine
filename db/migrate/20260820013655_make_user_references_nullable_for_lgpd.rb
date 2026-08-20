class MakeUserReferencesNullableForLgpd < ActiveRecord::Migration[8.1]
  def change
    change_column_null :issues, :creator_id, true
    change_column_null :documents, :author_id, true
  end
end
