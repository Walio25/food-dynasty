/**
 * Review & Rating System for Food Dynasty
 * Post-dining reviews, star ratings, photo uploads
 */

class ReviewManager {
    constructor() {
        this.reviews = [];
    }

    // Submit a review
    submitReview(reviewData) {
        const review = {
            id: 'REV-' + Date.now(),
            customerName: reviewData.name,
            customerEmail: reviewData.email,
            orderId: reviewData.orderId || null,
            rating: reviewData.rating, // 1-5
            foodRating: reviewData.foodRating || reviewData.rating,
            serviceRating: reviewData.serviceRating || reviewData.rating,
            ambianceRating: reviewData.ambianceRating || reviewData.rating,
            comment: reviewData.comment,
            photos: reviewData.photos || [],
            verified: !!reviewData.orderId, // Verified if linked to order
            helpful: 0,
            createdAt: new Date().toISOString(),
            status: 'pending' // pending, approved, rejected
        };

        // Save review
        const allReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        allReviews.unshift(review);
        localStorage.setItem('reviews', JSON.stringify(allReviews));

        // Save to user reviews
        if (reviewData.email) {
            const userReviews = JSON.parse(localStorage.getItem(`user_reviews_${reviewData.email}`) || '[]');
            userReviews.unshift(review);
            localStorage.setItem(`user_reviews_${reviewData.email}`, JSON.stringify(userReviews));

            // Award loyalty points
            if (typeof loyaltyManager !== 'undefined') {
                loyaltyManager.awardReviewPoints(reviewData.email);
            }
        }

        return { success: true, review: review };
    }

    // Get all approved reviews
    getApprovedReviews() {
        const allReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        return allReviews.filter(r => r.status === 'approved').sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    }

    // Get user reviews
    getUserReviews(email) {
        return JSON.parse(localStorage.getItem(`user_reviews_${email}`) || '[]');
    }

    // Calculate average ratings
    getAverageRatings() {
        const approved = this.getApprovedReviews();
        if (approved.length === 0) {
            return { overall: 0, food: 0, service: 0, ambiance: 0, count: 0 };
        }

        return {
            overall: (approved.reduce((sum, r) => sum + r.rating, 0) / approved.length).toFixed(1),
            food: (approved.reduce((sum, r) => sum + r.foodRating, 0) / approved.length).toFixed(1),
            service: (approved.reduce((sum, r) => sum + r.serviceRating, 0) / approved.length).toFixed(1),
            ambiance: (approved.reduce((sum, r) => sum + r.ambianceRating, 0) / approved.length).toFixed(1),
            count: approved.length
        };
    }

    // Mark review as helpful
    markHelpful(reviewId) {
        const allReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        const review = allReviews.find(r => r.id === reviewId);
        if (review) {
            review.helpful++;
            localStorage.setItem('reviews', JSON.stringify(allReviews));
        }
    }

    // Render star rating
    renderStars(rating, interactive = false, onChange = null) {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (interactive) {
                stars.push(`
                    <i class="fas fa-star star-rating ${i <= rating ? 'text-warning' : 'text-muted'}" 
                       data-rating="${i}"
                       onclick="${onChange}(${i})"
                       style="cursor: pointer; font-size: 1.5rem;"></i>
                `);
            } else {
                stars.push(`
                    <i class="fas fa-star ${i <= rating ? 'text-warning' : 'text-muted'}"></i>
                `);
            }
        }
        return stars.join('');
    }

    // Render reviews list
    renderReviewsList(containerId, limit = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let reviews = this.getApprovedReviews();
        if (limit) reviews = reviews.slice(0, limit);

        if (reviews.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-star fa-3x mb-3"></i>
                    <p>No reviews yet. Be the first to review!</p>
                </div>
            `;
            return;
        }

        const html = reviews.map(review => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="mb-1">
                                ${review.customerName}
                                ${review.verified ? '<span class="badge bg-success ms-2"><i class="fas fa-check-circle"></i> Verified</span>' : ''}
                            </h6>
                            <div class="mb-2">
                                ${this.renderStars(review.rating)}
                                <small class="text-muted ms-2">${new Date(review.createdAt).toLocaleDateString()}</small>
                            </div>
                        </div>
                    </div>
                    
                    ${review.comment ? `<p class="mb-2">${review.comment}</p>` : ''}
                    
                    <div class="row mb-2">
                        <div class="col-4">
                            <small class="text-muted">Food:</small>
                            ${this.renderStars(review.foodRating)}
                        </div>
                        <div class="col-4">
                            <small class="text-muted">Service:</small>
                            ${this.renderStars(review.serviceRating)}
                        </div>
                        <div class="col-4">
                            <small class="text-muted">Ambiance:</small>
                            ${this.renderStars(review.ambianceRating)}
                        </div>
                    </div>
                    
                    ${review.photos && review.photos.length > 0 ? `
                        <div class="review-photos mb-2">
                            ${review.photos.map(photo => `
                                <img src="${photo}" class="img-thumbnail me-2" style="width: 80px; height: 80px; object-fit: cover;">
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <button class="btn btn-sm btn-outline-secondary" onclick="reviewManager.markHelpful('${review.id}')">
                        <i class="fas fa-thumbs-up me-1"></i>Helpful (${review.helpful})
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // Render rating summary
    renderRatingSummary(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const ratings = this.getAverageRatings();

        const html = `
            <div class="card">
                <div class="card-body text-center">
                    <h2 class="display-4 mb-0">${ratings.overall}</h2>
                    <div class="mb-2">
                        ${this.renderStars(Math.round(ratings.overall))}
                    </div>
                    <p class="text-muted mb-0">Based on ${ratings.count} reviews</p>
                    
                    <hr>
                    
                    <div class="row text-start">
                        <div class="col-12 mb-2">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>Food:</span>
                                <div>
                                    ${this.renderStars(Math.round(ratings.food))}
                                    <span class="ms-2">${ratings.food}</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mb-2">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>Service:</span>
                                <div>
                                    ${this.renderStars(Math.round(ratings.service))}
                                    <span class="ms-2">${ratings.service}</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>Ambiance:</span>
                                <div>
                                    ${this.renderStars(Math.round(ratings.ambiance))}
                                    <span class="ms-2">${ratings.ambiance}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }
}

// Initialize
const reviewManager = new ReviewManager();
window.reviewManager = reviewManager;
