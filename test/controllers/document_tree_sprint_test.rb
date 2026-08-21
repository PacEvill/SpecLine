require "test_helper"

class DocumentTreeSprintTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @workspace = workspaces(:one)
    @project = projects(:one)
    @doc1 = documents(:one)
    @doc2 = documents(:two)
    sign_in @user
  end

  test "sprint: should move document into parent folder / document" do
    patch move_workspace_project_document_url(@workspace, @project, @doc1),
          params: { parent_id: @doc2.id, position: 1 },
          as: :json

    assert_response :success
    @doc1.reload
    assert_equal @doc2.id, @doc1.parent_id
    assert_equal 1, @doc1.position
  end

  test "sprint: should move document back to root" do
    @doc1.update!(parent_id: @doc2.id)

    patch move_workspace_project_document_url(@workspace, @project, @doc1),
          params: { parent_id: nil, position: 0 },
          as: :json

    assert_response :success
    @doc1.reload
    assert_nil @doc1.parent_id
    assert_equal 0, @doc1.position
  end

  test "sprint: should create document marked as folder" do
    assert_difference("Document.count", 1) do
      post workspace_project_documents_url(@workspace, @project),
           params: {
             document: {
               title: "Arquitetura e Backend",
               is_folder: true,
               icon: "📁"
             }
           }
    end

    created = Document.order(:id).last
    assert created.is_folder?
    assert_equal "📁", created.icon
  end
end
