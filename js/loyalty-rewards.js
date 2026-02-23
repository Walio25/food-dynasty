/**
 * Loyalty & Rewards Program for Food Dynasty
 * Points system, rewards tracking, and milestone achievements
 */

class LoyaltyManager {
    constructor() {
        this.pointsConfig = {
            perOrderRupee: 1,        // 1 point per ₹1 spent
            perBooking: 50,          // 50 points per table booking
            perReview: 25,           // 25 points per review
            referralBonus: 100,      // 100 points for successful referral
            birthdayBonus: 200       // 200 bonus points on birthday
        };

        this.rewardTiers = [
            { name: 'Bronze', minPoints: 0, discount: 0, color: '#cd7f32' },
            { name: 'Silver', minPoints: 500, discount: 5, color: '#c0c0c0' },
            { name: 'Gold', minPoints: 1500, discount: 10, color: '#ffd700' },
            { name: 'Platinum', minPoints: 3000, discount: 15, color: '#e5e4e2' },
            { name: 'Diamond', minPoints: 5000, discount: 20, color: '#b9f2ff' }
        ];

        this.rewards = [
            { id: 1, name: 'Free Dessert', points: 200, description: 'Get a complimentary dessert', icon: 'ice-cream' },
            { id: 2, name: 'Free Appetizer', points: 300, description: 'Free starter of your choice', icon: 'pizza-slice' },
            { id: 3, name: '10% Discount', points: 400, description: '10% off on next order', icon: 'percentage' },
            { id: 4, name: 'Free Beverage', points: 150, description: 'Complimentary drink', icon: 'glass-cheers' },
            { id: 5, name: 'Birthday Special', points: 500, description: 'Special meal on your birthday', icon: 'birthday-cake' },
            { id: 6, name: 'Free Main Course', points: 600, description: 'Free main dish', icon: 'hamburger' },
            { id: 7, name: '20% Discount', points: 800, description: '20% off on next order', icon: 'tags' },
            { id: 8, name: 'VIP Table', points: 1000, description: 'Reserved VIP table for a month', icon: 'crown' }
        ];

        this.milestones = [
            { orders: 1, title: 'First Order', bonus: 50, achieved: false },
            { orders: 5, title: 'Regular Customer', bonus: 100, achieved: false },
            { orders: 10, title: 'Loyal Customer', bonus: 200, achieved: false },
            { orders: 25, title: 'VIP Customer', bonus: 500, achieved: false },
            { orders: 50, title: 'Elite Customer', bonus: 1000, achieved: false },
            { orders: 100, title: 'Legend', bonus: 2000, achieved: false }
        ];
    }

    // Initialize loyalty program for user
    initUser(email) {
        const loyaltyKey = `loyalty_${email}`;
        let loyaltyData = localStorage.getItem(loyaltyKey);

        if (!loyaltyData) {
            loyaltyData = {
                email: email,
                points: 0,
                totalPoints: 0,
                tier: 'Bronze',
                redeemedRewards: [],
                pointsHistory: [],
                milestones: [...this.milestones],
                joinedDate: new Date().toISOString()
            };
            localStorage.setItem(loyaltyKey, JSON.stringify(loyaltyData));
        } else {
            loyaltyData = JSON.parse(loyaltyData);
        }

        return loyaltyData;
    }

    // Get user loyalty data
    getUserLoyalty(email) {
        const loyaltyKey = `loyalty_${email}`;
        const data = localStorage.getItem(loyaltyKey);
        return data ? JSON.parse(data) : this.initUser(email);
    }

    // Save loyalty data
    saveLoyalty(email, data) {
        const loyaltyKey = `loyalty_${email}`;
        localStorage.setItem(loyaltyKey, JSON.stringify(data));
    }

    // Add points
    addPoints(email, points, reason) {
        const loyalty = this.getUserLoyalty(email);
        
        loyalty.points += points;
        loyalty.totalPoints += points;
        loyalty.pointsHistory.unshift({
            points: points,
            reason: reason,
            date: new Date().toISOString(),
            type: 'earned'
        });

        // Update tier
        loyalty.tier = this.calculateTier(loyalty.totalPoints);

        // Check milestones
        this.checkMilestones(email, loyalty);

        this.saveLoyalty(email, loyalty);
        return loyalty;
    }

    // Deduct points (for redemption)
    deductPoints(email, points, reason) {
        const loyalty = this.getUserLoyalty(email);
        
        if (loyalty.points < points) {
            return { success: false, error: 'Insufficient points' };
        }

        loyalty.points -= points;
        loyalty.pointsHistory.unshift({
            points: -points,
            reason: reason,
            date: new Date().toISOString(),
            type: 'redeemed'
        });

        this.saveLoyalty(email, loyalty);
        return { success: true, loyalty: loyalty };
    }

    // Calculate tier based on total points
    calculateTier(totalPoints) {
        for (let i = this.rewardTiers.length - 1; i >= 0; i--) {
            if (totalPoints >= this.rewardTiers[i].minPoints) {
                return this.rewardTiers[i].name;
            }
        }
        return 'Bronze';
    }

    // Get tier info
    getTierInfo(tierName) {
        return this.rewardTiers.find(t => t.name === tierName) || this.rewardTiers[0];
    }

    // Get next tier
    getNextTier(currentPoints) {
        for (let tier of this.rewardTiers) {
            if (currentPoints < tier.minPoints) {
                return {
                    tier: tier,
                    pointsNeeded: tier.minPoints - currentPoints
                };
            }
        }
        return null; // Already at highest tier
    }

    // Award points for order
    awardOrderPoints(email, orderTotal) {
        const points = Math.floor(orderTotal * this.pointsConfig.perOrderRupee);
        return this.addPoints(email, points, `Order worth ₹${orderTotal.toFixed(2)}`);
    }

    // Award points for booking
    awardBookingPoints(email) {
        return this.addPoints(email, this.pointsConfig.perBooking, 'Table booking');
    }

    // Award points for review
    awardReviewPoints(email) {
        return this.addPoints(email, this.pointsConfig.perReview, 'Customer review');
    }

    // Award referral bonus
    awardReferralBonus(email, referredEmail) {
        return this.addPoints(email, this.pointsConfig.referralBonus, `Referred ${referredEmail}`);
    }

    // Award birthday bonus
    awardBirthdayBonus(email) {
        return this.addPoints(email, this.pointsConfig.birthdayBonus, 'Birthday bonus');
    }

    // Check and award milestones
    checkMilestones(email, loyalty) {
        const orders = JSON.parse(localStorage.getItem(`orders_${email}`) || '[]');
        const orderCount = orders.filter(o => o.status === 'delivered').length;

        loyalty.milestones.forEach(milestone => {
            if (!milestone.achieved && orderCount >= milestone.orders) {
                milestone.achieved = true;
                loyalty.points += milestone.bonus;
                loyalty.totalPoints += milestone.bonus;
                loyalty.pointsHistory.unshift({
                    points: milestone.bonus,
                    reason: `Milestone: ${milestone.title}`,
                    date: new Date().toISOString(),
                    type: 'milestone'
                });
                this.showMilestoneNotification(milestone);
            }
        });
    }

    // Redeem reward
    redeemReward(email, rewardId) {
        const reward = this.rewards.find(r => r.id === rewardId);
        if (!reward) {
            return { success: false, error: 'Reward not found' };
        }

        const result = this.deductPoints(email, reward.points, `Redeemed: ${reward.name}`);
        
        if (result.success) {
            const loyalty = result.loyalty;
            loyalty.redeemedRewards.unshift({
                rewardId: rewardId,
                rewardName: reward.name,
                pointsSpent: reward.points,
                date: new Date().toISOString(),
                code: 'RWD-' + Date.now()
            });
            this.saveLoyalty(email, loyalty);
            return { success: true, loyalty: loyalty, reward: reward };
        }

        return result;
    }

    // Get available rewards for user
    getAvailableRewards(email) {
        const loyalty = this.getUserLoyalty(email);
        return this.rewards.map(reward => ({
            ...reward,
            canRedeem: loyalty.points >= reward.points
        }));
    }

    // Show milestone notification
    showMilestoneNotification(milestone) {
        const notification = document.createElement('div');
        notification.className = 'alert alert-success position-fixed';
        notification.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px; animation: slideInRight 0.5s;';
        notification.innerHTML = `
            <h5><i class="fas fa-trophy me-2 text-warning"></i>Milestone Achieved!</h5>
            <p class="mb-0"><strong>${milestone.title}</strong></p>
            <p class="mb-0"><small>+${milestone.bonus} bonus points!</small></p>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 5000);
    }

    // Render loyalty card widget
    renderLoyaltyCard(email, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const loyalty = this.getUserLoyalty(email);
        const tierInfo = this.getTierInfo(loyalty.tier);
        const nextTier = this.getNextTier(loyalty.totalPoints);

        const html = `
            <div class="card" style="background: linear-gradient(135deg, ${tierInfo.color} 0%, #667eea 100%); color: white;">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 class="mb-1">Loyalty Card</h5>
                            <p class="mb-0 opacity-75">Member since ${new Date(loyalty.joinedDate).getFullYear()}</p>
                        </div>
                        <span class="badge bg-white text-dark px-3 py-2">
                            <i class="fas fa-crown me-1"></i>${loyalty.tier}
                        </span>
                    </div>
                    
                    <div class="mb-3">
                        <h2 class="mb-0">${loyalty.points} <small>points</small></h2>
                        <small class="opacity-75">Total earned: ${loyalty.totalPoints} points</small>
                    </div>

                    ${nextTier ? `
                        <div class="mb-2">
                            <div class="d-flex justify-content-between mb-1">
                                <small>${nextTier.pointsNeeded} points to ${nextTier.tier.name}</small>
                                <small>${((loyalty.totalPoints / nextTier.tier.minPoints) * 100).toFixed(0)}%</small>
                            </div>
                            <div class="progress" style="height: 8px; background: rgba(255,255,255,0.3);">
                                <div class="progress-bar" style="width: ${((loyalty.totalPoints / nextTier.tier.minPoints) * 100)}%; background: white;"></div>
                            </div>
                        </div>
                    ` : '<p class="mb-0"><i class="fas fa-star me-2"></i>Highest tier achieved!</p>'}

                    <div class="mt-3">
                        <span class="badge bg-white bg-opacity-25 me-2">
                            <i class="fas fa-percentage me-1"></i>${tierInfo.discount}% Discount
                        </span>
                        <span class="badge bg-white bg-opacity-25">
                            <i class="fas fa-gift me-1"></i>${loyalty.redeemedRewards.length} Rewards Redeemed
                        </span>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    // Render rewards catalog
    renderRewardsCatalog(email, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const availableRewards = this.getAvailableRewards(email);
        const loyalty = this.getUserLoyalty(email);

        const html = `
            <div class="row g-3">
                <div class="col-12 mb-3">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        You have <strong>${loyalty.points} points</strong> available to redeem
                    </div>
                </div>
                ${availableRewards.map(reward => `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 ${reward.canRedeem ? '' : 'opacity-50'}">
                            <div class="card-body text-center">
                                <i class="fas fa-${reward.icon} fa-3x text-primary mb-3"></i>
                                <h5 class="card-title">${reward.name}</h5>
                                <p class="card-text text-muted">${reward.description}</p>
                                <h4 class="text-primary mb-3">${reward.points} <small>points</small></h4>
                                <button class="btn btn-${reward.canRedeem ? 'primary' : 'secondary'} w-100"
                                        onclick="loyaltyManager.redeemReward('${email}', ${reward.id})"
                                        ${!reward.canRedeem ? 'disabled' : ''}>
                                    <i class="fas fa-${reward.canRedeem ? 'check' : 'lock'} me-2"></i>
                                    ${reward.canRedeem ? 'Redeem' : `Need ${reward.points - loyalty.points} more`}
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = html;
    }

    // Render points history
    renderPointsHistory(email, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const loyalty = this.getUserLoyalty(email);
        const history = loyalty.pointsHistory.slice(0, 10); // Last 10 transactions

        const html = `
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0"><i class="fas fa-history me-2"></i>Recent Activity</h5>
                </div>
                <div class="card-body p-0">
                    ${history.length === 0 ? `
                        <p class="text-center text-muted py-4">No activity yet</p>
                    ` : `
                        <div class="list-group list-group-flush">
                            ${history.map(item => `
                                <div class="list-group-item">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <i class="fas fa-${item.type === 'earned' ? 'plus-circle text-success' : item.type === 'milestone' ? 'trophy text-warning' : 'minus-circle text-danger'} me-2"></i>
                                            ${item.reason}
                                            <br>
                                            <small class="text-muted">${new Date(item.date).toLocaleString()}</small>
                                        </div>
                                        <span class="badge bg-${item.points > 0 ? 'success' : 'danger'} fs-6">
                                            ${item.points > 0 ? '+' : ''}${item.points}
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;

        container.innerHTML = html;
    }
}

// Initialize
const loyaltyManager = new LoyaltyManager();
window.loyaltyManager = loyaltyManager;
