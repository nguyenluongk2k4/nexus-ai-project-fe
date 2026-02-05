import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuth } from '@/modules/auth/AuthProvider';
import { useTranslation } from 'react-i18next';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { createRoot } from 'react-dom/client';

interface TourContextType {
    startTour: (tourName: 'dashboard' | 'skillTree' | 'masterSkillTree') => void;
    isTourRunning: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, completeTour } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();
    const [isTourRunning, setIsTourRunning] = useState(false);

    const completeTourOnBackend = async (phase?: string) => {
        try {
            await completeTour(phase);
        } catch (error) {
            console.error('Failed to complete tour:', error);
        }
    };

    const startTour = (tourName: 'dashboard' | 'skillTree' | 'masterSkillTree') => {
        if (isTourRunning) return;

        const isDesktop = window.innerWidth >= 1024;
        const statsElement = isDesktop ? '#tour-stats-desktop' : '#tour-stats';

        const steps = tourName === 'dashboard' ? [
            {
                element: '#tour-greeting',
                popover: {
                    title: t('tour.welcome.title', 'Chào mừng bạn!'),
                    description: t('tour.welcome.desc', 'Tôi là Shiba, người bạn đồng hành của bạn. Hãy để tôi dẫn bạn đi khám phá Nexus AI nhé!'),
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: statsElement,
                popover: {
                    title: t('tour.stats.title', 'Chỉ số học tập'),
                    description: t('tour.stats.desc', 'Theo dõi tiến trình, số skill đã đạt được và chuỗi ngày học tập của bạn tại đây.'),
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '#tour-continue',
                popover: {
                    title: t('tour.continue.title', 'Học tập liên tục'),
                    description: t('tour.continue.desc', 'Quay lại bài học dang dở chỉ với một nút bấm.'),
                    side: "top",
                    align: 'start'
                }
            },
            {
                element: '#tour-ai-insights',
                popover: {
                    title: t('tour.ai.title', 'AI Tư vấn'),
                    description: t('tour.ai.desc', 'AI sẽ phân tích dữ liệu của bạn để đưa ra lời khuyên cá nhân hóa.'),
                    side: "left",
                    align: 'start'
                }
            },
            {
                element: '#tour-navigation',
                popover: {
                    title: t('tour.nav.title', 'Khám phá thêm'),
                    description: t('tour.nav.desc', 'Sử dụng menu này để truy cập Forum, Timeline và quản lý Nhiệm vụ.'),
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#tour-user-menu',
                popover: {
                    title: t('tour.menu.title', 'Trình đơn cá nhân'),
                    description: t('tour.menu.desc', 'Ấn vào đây để mở rộng thực đơn và bắt đầu chuyến hành trình của mình nhé!'),
                    side: "bottom",
                    align: 'end'
                }
            },
            {
                element: '#tour-my-roadmap',
                popover: {
                    title: t('tour.roadmap.title', 'Bản đồ học tập'),
                    description: t('tour.roadmap.desc', 'Click vào đây để xem "Cây tri thức" cá nhân hóa của riêng bạn.'),
                    side: "left",
                    align: 'start'
                }
            }
        ] : tourName === 'skillTree' ? [
            {
                element: '#tour-tree-container',
                popover: {
                    title: t('tour.tree.title', 'Cây Kỹ Năng của bạn'),
                    description: t('tour.tree.desc', 'Đây là nơi mọi kiến thức của bạn hội tụ. Cái cây sẽ lớn dần lên khi bạn chinh phục các bài học.'),
                    side: "bottom",
                    align: 'center'
                }
            },
            {
                element: '#tour-tree-avatar',
                popover: {
                    title: t('tour.tree.root', 'Gốc rễ sự phát triển'),
                    description: t('tour.tree.rootDesc', 'Bạn chính là gốc rễ. Những "hạt mầm" chuyên môn sẽ bắt đầu mọc lên từ đây.'),
                    side: "top",
                    align: 'center'
                }
            },
            {
                element: '#tour-skill-panel',
                popover: {
                    title: t('tour.tree.panel', 'Kho tài nguyên'),
                    description: t('tour.tree.panelDesc', 'Chọn một nút trên cây để xem tài liệu học tập, lộ trình và thực hành cùng AI ngay tại đây.'),
                    side: "left",
                    align: 'start'
                }
            },
            {
                element: '#tour-add-skills',
                popover: {
                    title: t('tour.tree.add', 'Tiếp tục vươn xa'),
                    description: t('tour.tree.addDesc', 'Đừng dừng lại! Hãy thêm những kỹ năng mới để mở rộng bản đồ trí tuệ của mình nhé.'),
                    side: "top",
                    align: 'end'
                }
            }
        ] : tourName === 'masterSkillTree' ? [
            {
                element: '#tour-master-empty',
                popover: {
                    title: t('tour.master.title', 'Cây kỹ năng tổng thể'),
                    description: t('tour.master.desc', 'Đây là nơi chứa đựng tinh hoa tri thức. Bạn có thể khám phá mọi kỹ năng ở đây!'),
                    side: "bottom",
                    align: 'center'
                }
            },
            {
                element: '#tour-master-tree',
                popover: {
                    title: t('tour.master.tree', 'Khám phá tri thức'),
                    description: t('tour.master.treeDesc', 'Tương tác với các nút để mở rộng tầm nhìn. Mỗi nút là một chân trời mới đang chờ đón.'),
                    side: "bottom",
                    align: 'center'
                }
            },
            {
                element: '#tour-master-chat-input',
                popover: {
                    title: t('tour.master.chat', 'Trợ lý AI của bạn'),
                    description: t('tour.master.chatDesc', 'Có thắc mắc? Đừng ngần ngại đặt câu hỏi cho AI để được giải đáp chi tiết nhất.'),
                    side: "left",
                    align: 'end'
                }
            },
            {
                element: '#tour-master-footer',
                popover: {
                    title: t('tour.master.save', 'Lưu về lộ trình'),
                    description: t('tour.master.saveDesc', 'Nếu thấy thú vị, hãy lưu ngay vào lộ trình cá nhân để bắt đầu chinh phục nhé!'),
                    side: "top",
                    align: 'center'
                }
            }
        ] : [];

        const driverObj = driver({
            showProgress: true,
            animate: true,
            overlayColor: 'rgba(0,0,0,0.75)',
            popoverClass: 'shiba-tour-popover',
            stagePadding: 10,
            steps: steps as any,
            onPopoverRender: (popover: any, { state }: any) => {
                const wrapper = popover.wrapper;
                const activeIndex = state.activeIndex;

                if (wrapper) {
                    const title = wrapper.querySelector('.driver-popover-title');
                    const description = wrapper.querySelector('.driver-popover-description');
                    const footer = wrapper.querySelector('.driver-popover-footer');

                    if (title) {
                        title.style.cssText = 'font-weight: 900; font-size: 1.25rem; margin-top: 8px; text-transform: uppercase; color: #1e293b;';
                    }

                    if (description) {
                        description.style.cssText = 'color: #475569; font-weight: 500; font-size: 1rem; line-height: 1.5; margin-bottom: 12px;';

                        let shibaContainer = description.querySelector('#shiba-lottie');
                        if (!shibaContainer) {
                            shibaContainer = document.createElement('div');
                            shibaContainer.id = 'shiba-lottie';
                            shibaContainer.style.cssText = 'display: flex; justify-content: center; margin-bottom: 8px;';
                            description.insertBefore(shibaContainer, description.firstChild);
                        }

                        let animationFile = 'happy.lottie';
                        if (activeIndex === 1) animationFile = 'talk.lottie';
                        if (activeIndex === 2) animationFile = 'flirting.lottie';
                        if (activeIndex === 3) animationFile = 'talk2.lottie';
                        if (activeIndex === 4) animationFile = 'talk.lottie';

                        let lottiePlayer = shibaContainer.querySelector('dotlottie-player') as any;
                        if (!lottiePlayer) {
                            lottiePlayer = document.createElement('dotlottie-player');
                            lottiePlayer.setAttribute('autoplay', 'true');
                            lottiePlayer.setAttribute('loop', 'true');
                            lottiePlayer.style.width = '140px';
                            lottiePlayer.style.height = '140px';
                            shibaContainer.appendChild(lottiePlayer);
                        }

                        const currentSrc = lottiePlayer.getAttribute('src');
                        const newSrc = `/assets/shiba-inu/${animationFile}`;
                        if (currentSrc !== newSrc) {
                            lottiePlayer.setAttribute('src', newSrc);
                        }
                    }

                    if (footer) {
                        const nextBtn = footer.querySelector('.driver-popover-next-btn');
                        const prevBtn = footer.querySelector('.driver-popover-prev-btn');
                        const progress = footer.querySelector('.driver-popover-progress-text');

                        footer.style.cssText = 'border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px;';

                        if (nextBtn) {
                            const nextText = activeIndex === steps.length - 1 ? t('common.done', 'Xong!') : t('common.next', 'Tiếp tục →');
                            nextBtn.innerHTML = `<span>${nextText}</span>`;
                            nextBtn.style.cssText = 'background: #0f172a; color: white !important; border: none !important; border-radius: 12px !important; padding: 10px 24px !important; font-weight: 700 !important; font-size: 0.9rem !important; cursor: pointer; transition: all 0.2s; flex-shrink: 0; text-shadow: none !important; -webkit-font-smoothing: antialiased;';
                        }
                        if (prevBtn) {
                            const prevText = '← ' + t('common.prev', 'Quay lại');
                            prevBtn.innerHTML = `<span>${prevText}</span>`;
                            prevBtn.style.cssText = 'color: #64748b !important; font-weight: 600 !important; font-size: 0.9rem !important; cursor: pointer; background: none !important; border: none !important; padding: 8px 16px !important; text-shadow: none !important; -webkit-font-smoothing: antialiased;';
                        }
                        if (progress) {
                            progress.style.cssText = 'color: #94a3b8; font-size: 0.85rem; font-weight: 600; order: -1; margin-right: auto;';
                        }
                    }
                }
            },
            onDestroyed: () => {
                setIsTourRunning(false);

                // Redirection happens natively when the user clicks the menu item.

                if (user) {
                    if (tourName === 'dashboard' && !user.hasCompletedDashboardTour) {
                        completeTourOnBackend('dashboard');
                    } else if (tourName === 'skillTree' && !user.hasCompletedSkillTreeTour) {
                        completeTourOnBackend('skilltree');
                    } else if (tourName === 'masterSkillTree' && !user.hasCompletedMasterSkillTreeTour) {
                        completeTourOnBackend('masterskilltree');
                    }
                }
            }
        });

        setIsTourRunning(true);
        driverObj.drive();
    };

    useEffect(() => {
        // Auto start tour on dashboard if not completed
        if (user && !user.hasCompletedDashboardTour && location.pathname === '/dashboard') {
            const timer = setTimeout(() => {
                startTour('dashboard');
            }, 1000);
            return () => clearTimeout(timer);
        }

        if (user && !user.hasCompletedMasterSkillTreeTour && location.pathname === '/skilltree') {
            console.log('[DEBUG] Triggering masterSkillTree tour. Flags:', {
                master: user.hasCompletedMasterSkillTreeTour
            });
            const timer = setTimeout(() => {
                startTour('masterSkillTree');
            }, 1000);
            return () => clearTimeout(timer);
        }

        // Check for manual trigger via query param (multi-page transition)
        // OR auto-start if on my-skills and never completed skill tree tour
        const params = new URLSearchParams(location.search);

        if (user && location.pathname === '/my-skills') {
            const shouldStartSkillTree = params.get('startTour') === 'skillTree' || !user.hasCompletedSkillTreeTour;

            if (shouldStartSkillTree) {
                const timer = setTimeout(() => {
                    startTour('skillTree');
                    // Clean up URL without refreshing
                    if (params.get('startTour')) {
                        window.history.replaceState({}, '', location.pathname);
                    }
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [user, location.pathname, location.search]);


    return (
        <TourContext.Provider value={{ startTour, isTourRunning }}>
            {children}

            {/* Injected CSS to style the driver popover like a comic bubble */}
            <style>
                {`
                    .shiba-tour-popover {
                        background: #ffffff !important;
                        border: 4px solid #0f172a !important;
                        border-radius: 2rem !important;
                        padding: 16px !important;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                        max-width: 320px !important;
                        font-family: 'Inter', sans-serif !important;
                    }

                    /* Comic arrow style */
                    .shiba-tour-popover .driver-popover-arrow {
                        border-width: 12px !important;
                    }

                    .driver-popover-progress-text {
                        color: #94a3b8 !important;
                        font-family: inherit !important;
                        font-weight: 600 !important;
                        font-size: 0.75rem !important;
                    }

                    .driver-overlay {
                        z-index: 9999990 !important;
                    }
                    
                    .driver-highlight-element {
                        z-index: 9999995 !important;
                    }
                    
                    .driver-popover {
                        z-index: 9999999 !important;
                    }
                `}
            </style>
        </TourContext.Provider>
    );
};

export const useTour = () => {
    const context = useContext(TourContext);
    if (context === undefined) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};
