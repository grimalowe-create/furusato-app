// ふるさと納税控除額シミュレーター
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('simulatorForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateDeduction();
    });
});

function calculateDeduction() {
    // フォーム値の取得
    const incomeMan = parseInt(document.getElementById('income').value);
    const income = incomeMan * 10000; // 万円→円に変換
    const family = document.querySelector('input[name="family"]:checked').value;
    const housing = document.querySelector('input[name="housing"]:checked').value === 'yes';
    const medical = document.querySelector('input[name="medical"]:checked').value === 'yes';
    const insurance = document.querySelector('input[name="insurance"]:checked').value === 'yes';

    // 扶養控除額の取得
    let dependentDeduction = 0;
    if (family === 'child1' || family === 'child2') {
        const child1 = document.querySelector('input[name="child1age"]:checked');
        if (child1) dependentDeduction += parseInt(child1.value);
        if (family === 'child2') {
            const child2 = document.querySelector('input[name="child2age"]:checked');
            if (child2) dependentDeduction += parseInt(child2.value);
        }
    }

    // 控除額の計算
    const result = simulateDeduction(income, family, housing, medical, insurance, dependentDeduction);

    // 結果を表示
    displayResult(result);
}

function simulateDeduction(income, family, housing, medical, insurance, dependentDeduction = 0) {
    // 扶養控除を課税所得から差し引いた実効収入で計算
    const adjustedIncome = Math.max(0, income - dependentDeduction);
    let limitAmount = calculateLimitByIncome(adjustedIncome, family);
    
    // その他の控除による減額（概算）
    let reductionAmount = 0;
    if (housing) {
        reductionAmount += limitAmount * 0.15; // 住宅ローン控除で約15%減
    }
    if (medical) {
        reductionAmount += limitAmount * 0.1; // 医療費控除で約10%減  
    }
    if (insurance) {
        reductionAmount += limitAmount * 0.08; // 生命保険料控除で約8%減
    }
    
    limitAmount = Math.max(2000, limitAmount - reductionAmount);

    // 実質負担額は常に2,000円
    const realBurden = 2000;

    // 節税効果 = 控除上限額 - 2,000円
    const taxSavings = Math.max(0, limitAmount - realBurden);

    // おすすめの寄付額 = 控除上限額（安全マージンなし）
    const recommendAmount = limitAmount;

    return {
        limitAmount: limitAmount,
        realBurden: realBurden,
        taxSavings: taxSavings,
        recommendAmount: recommendAmount
    };
}

function calculateLimitByIncome(income, family) {
    // 家族構成による係数
    let familyFactor = 1.0;
    switch (family) {
        case 'single':
            familyFactor = 1.0;
            break;
        case 'double':
            familyFactor = 0.95; // 共働き夫婦は約5%減
            break;
        case 'spouse':
            familyFactor = 0.55; // 専業主婦（夫）ありは約45%減
            break;
        case 'child1':
            familyFactor = 0.48; // 子供1人は約52%減
            break;
        case 'child2':
            familyFactor = 0.30; // 子供2人以上は約70%減
            break;
    }

    // 年収ごとの控除上限額の目安（ふるさと納税ポータルサイト参照）
    let baseLimit = 0;
    
    if (income < 3000000) {
        baseLimit = 28000; // 300万円未満
    } else if (income < 4000000) {
        baseLimit = 42000; // 300～400万円
    } else if (income < 5000000) {
        baseLimit = 54000; // 400～500万円
    } else if (income < 6000000) {
        baseLimit = 68000; // 500～600万円
    } else if (income < 7000000) {
        baseLimit = 82000; // 600～700万円
    } else if (income < 8000000) {
        baseLimit = 96000; // 700～800万円
    } else if (income < 9000000) {
        baseLimit = 110000; // 800～900万円
    } else if (income < 10000000) {
        baseLimit = 124000; // 900～1000万円
    } else {
        baseLimit = 150000; // 1000万円以上
    }

    return Math.round(baseLimit * familyFactor);
}

function getIncomeTaxRate(taxableIncome) {
    if (taxableIncome <= 1950000) {
        return 0.05;
    } else if (taxableIncome <= 3300000) {
        return 0.1;
    } else if (taxableIncome <= 6950000) {
        return 0.2;
    } else if (taxableIncome <= 9000000) {
        return 0.23;
    } else if (taxableIncome <= 18000000) {
        return 0.33;
    } else if (taxableIncome <= 40000000) {
        return 0.4;
    } else {
        return 0.45;
    }
}

function displayResult(result) {
    // 数値を表示用にフォーマット
    const limitAmount = formatNumber(result.limitAmount);
    const taxSavings = formatNumber(result.taxSavings);
    const recommendAmount = formatNumber(result.recommendAmount);

    // 結果を表示
    document.getElementById('limitAmount').textContent = limitAmount;
    document.getElementById('taxSavings').textContent = taxSavings;
    document.getElementById('recommendAmount').textContent = recommendAmount;

    // 結果コンテナを表示
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.classList.remove('hidden');

    // スムーズにスクロール
    setTimeout(() => {
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function updateChildAgeFields() {
    const family = document.querySelector('input[name="family"]:checked').value;
    const section = document.getElementById('childAgeSection');
    const child2Group = document.getElementById('child2AgeGroup');

    if (family === 'child1') {
        section.style.display = 'block';
        child2Group.style.display = 'none';
        // 第2子の選択をリセット
        document.querySelectorAll('input[name="child2age"]').forEach(r => r.checked = false);
    } else if (family === 'child2') {
        section.style.display = 'block';
        child2Group.style.display = 'block';
    } else {
        section.style.display = 'none';
        document.querySelectorAll('input[name="child1age"]').forEach(r => r.checked = false);
        document.querySelectorAll('input[name="child2age"]').forEach(r => r.checked = false);
    }
}

function updateIncomePreview() {
    const val = parseInt(document.getElementById('income').value);
    const preview = document.getElementById('incomePreview');
    if (!isNaN(val) && val > 0) {
        preview.textContent = `→ ${val}万円（${formatNumber(val * 10000)}円）`;
    } else {
        preview.textContent = '';
    }
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
