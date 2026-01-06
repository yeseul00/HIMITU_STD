/**
 * main.js
 * TMA API Explorer 메인 엔트리 포인트
 */

import { TMAWrapper } from "./TMAWrapper.js";
import { Storage } from "./Storage.js";

// 전역 인스턴스
const tma = new TMAWrapper();
const storage = new Storage();

// 상수
const STORAGE_KEY = "test_value";

/**
 * 초기화
 */
function init() {
    console.log("🚀 TMA API Explorer 시작");

    // 유저 정보 표시
    displayUserInfo();

    // 플랫폼 정보 표시
    displayPlatformInfo();

    // 테마 정보 표시
    displayThemeInfo();

    // 이벤트 리스너 등록
    setupEventListeners();

    // CloudStorage 초기 로드
    loadStoredValue();
}

/**
 * 유저 정보 표시
 */
function displayUserInfo() {
    const user = tma.getUserInfo();

    if (user) {
        document.getElementById("userId").textContent = user.id || "-";
        document.getElementById("userName").textContent =
            `${user.first_name || ""} ${user.last_name || ""}`.trim() || "-";
        document.getElementById("userPremium").textContent = user.is_premium
            ? "✅"
            : "❌";
        document.getElementById("userLang").textContent =
            user.language_code || "-";
    } else {
        document.getElementById("userId").textContent = "정보 없음";
        document.getElementById("userName").textContent = "-";
        document.getElementById("userPremium").textContent = "-";
        document.getElementById("userLang").textContent = "-";
    }
}

/**
 * 플랫폼 정보 표시
 */
function displayPlatformInfo() {
    const platform = tma.getPlatform();
    const version = tma.getVersion();

    document.getElementById("platformInfo").textContent = platform;
    document.getElementById("versionInfo").textContent = version;
}

/**
 * 테마 정보 표시
 */
function displayThemeInfo() {
    const colorScheme = tma.getColorScheme();
    const themeParams = tma.getThemeParams();

    document.getElementById("themeMode").textContent =
        colorScheme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode";

    // 배경색
    const bg = themeParams.bg_color || "#ffffff";
    document.getElementById("themeBg").textContent = bg;
    document.getElementById("themeBgPreview").style.backgroundColor = bg;

    // 텍스트 색
    const text = themeParams.text_color || "#000000";
    document.getElementById("themeText").textContent = text;
    document.getElementById("themeTextPreview").style.backgroundColor = text;

    // 버튼 색
    const button = themeParams.button_color || "#3390ec";
    document.getElementById("themeButton").textContent = button;
    document.getElementById("themeButtonPreview").style.backgroundColor = button;
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    // CloudStorage 버튼들
    document.getElementById("saveBtn").addEventListener("click", saveValue);
    document.getElementById("loadBtn").addEventListener("click", loadStoredValue);
    document.getElementById("deleteBtn").addEventListener("click", deleteValue);

    // HapticFeedback 버튼들
    document.querySelectorAll(".btn-haptic").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const hapticType = e.target.dataset.haptic;
            triggerHaptic(hapticType);
        });
    });

    // MainButton 버튼들
    document
        .getElementById("showMainBtn")
        .addEventListener("click", () => showMainButton());
    document
        .getElementById("hideMainBtn")
        .addEventListener("click", () => hideMainButton());

    // Alert/Confirm 버튼들
    document
        .getElementById("showAlertBtn")
        .addEventListener("click", () => showAlert());
    document
        .getElementById("showConfirmBtn")
        .addEventListener("click", () => showConfirm());
}

/**
 * CloudStorage: 값 저장
 */
async function saveValue() {
    const input = document.getElementById("storageInput");
    const value = input.value.trim();

    if (!value) {
        tma.showAlert("저장할 값을 입력해주세요.");
        return;
    }

    const success = await storage.save(STORAGE_KEY, value);

    if (success) {
        tma.hapticNotification("success");
        tma.showAlert("저장 완료!");
        document.getElementById("storageValue").textContent = value;
        input.value = "";
    } else {
        tma.hapticNotification("error");
        tma.showAlert("저장 실패!");
    }
}

/**
 * CloudStorage: 값 불러오기
 */
async function loadStoredValue() {
    const value = await storage.load(STORAGE_KEY);

    if (value !== null) {
        document.getElementById("storageValue").textContent = value;
        tma.hapticImpact("light");
    } else {
        document.getElementById("storageValue").textContent = "(값 없음)";
    }
}

/**
 * CloudStorage: 값 삭제
 */
async function deleteValue() {
    const success = await storage.remove(STORAGE_KEY);

    if (success) {
        tma.hapticNotification("success");
        tma.showAlert("삭제 완료!");
        document.getElementById("storageValue").textContent = "-";
    } else {
        tma.hapticNotification("error");
        tma.showAlert("삭제 실패!");
    }
}

/**
 * HapticFeedback 트리거
 */
function triggerHaptic(type) {
    switch (type) {
        case "light":
        case "medium":
        case "heavy":
            tma.hapticImpact(type);
            break;
        case "success":
        case "error":
            tma.hapticNotification(type);
            break;
    }
}

/**
 * MainButton 표시
 */
function showMainButton() {
    tma.showMainButton("메인 버튼 클릭!", () => {
        tma.showAlert("MainButton이 클릭되었습니다! 🎉");
        tma.hapticNotification("success");
    });
}

/**
 * MainButton 숨기기
 */
function hideMainButton() {
    tma.hideMainButton();
    tma.hapticImpact("light");
}

/**
 * Alert 팝업 표시
 */
function showAlert() {
    tma.showAlert("이것은 Alert 팝업입니다! 📢", () => {
        console.log("Alert 닫힘");
    });
}

/**
 * Confirm 팝업 표시
 */
function showConfirm() {
    tma.showConfirm("계속 진행하시겠습니까?", (confirmed) => {
        if (confirmed) {
            tma.showAlert("확인을 선택했습니다! ✅");
            tma.hapticNotification("success");
        } else {
            tma.showAlert("취소를 선택했습니다! ❌");
            tma.hapticImpact("light");
        }
    });
}

// 앱 시작
init();
