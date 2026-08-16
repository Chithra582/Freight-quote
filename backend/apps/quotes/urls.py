from django.urls import path
from apps.quotes.views import (
    QuoteListCreateView, QuoteDetailView, QuoteAdjustMarginView,
    QuoteApproveView, QuoteRejectView, QuoteIssueView, QuoteAcceptView,
    QuoteDeclineView, QuoteDocumentDownloadView, ApprovalQueueListView,
    MarginPolicyListView, ApprovalRuleListView
)

urlpatterns = [
    path('', QuoteListCreateView.as_view(), name='quote_list_create'),
    path('approvals/queue/', ApprovalQueueListView.as_view(), name='quote_approval_queue'),
    path('margin-policies/', MarginPolicyListView.as_view(), name='quote_margin_policies'),
    path('approval-rules/', ApprovalRuleListView.as_view(), name='quote_approval_rules'),
    path('<uuid:pk>/', QuoteDetailView.as_view(), name='quote_detail'),
    path('<uuid:pk>/margin/', QuoteAdjustMarginView.as_view(), name='quote_adjust_margin'),
    path('<uuid:pk>/approve/', QuoteApproveView.as_view(), name='quote_approve'),
    path('<uuid:pk>/reject/', QuoteRejectView.as_view(), name='quote_reject'),
    path('<uuid:pk>/issue/', QuoteIssueView.as_view(), name='quote_issue'),
    path('<uuid:pk>/accept/', QuoteAcceptView.as_view(), name='quote_accept'),
    path('<uuid:pk>/decline/', QuoteDeclineView.as_view(), name='quote_decline'),
    path('<uuid:pk>/document/', QuoteDocumentDownloadView.as_view(), name='quote_document_download'),
]
